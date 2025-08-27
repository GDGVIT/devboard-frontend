"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Save,
  Copy,
  Type,
  ImageIcon,
  BarChart3,
  Star,
  ArrowLeft,
  Layers,
  Zap,
  ZoomIn,
  ZoomOut,
  Square,
  Circle,
  Triangle,
  Plus,
  Hash,
  Sun,
  Moon,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  Settings,
  GripVertical,
  Github,
  RefreshCw,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Maximize2,
  Lock,
  Unlock,
  Target,
  Sparkles,
  Palette,
  Move,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Enhanced Types
interface WidgetElement {
  id: string
  type: "text" | "image" | "chart" | "badge" | "progress" | "container" | "shape" | "icon" | "line" | "button" | "qr"
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  style: {
    backgroundColor?: string
    color?: string
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    borderStyle?: string
    padding?: number
    opacity?: number
    shadow?: string
    gradient?: string
    zIndex?: number
  }
  content: {
    text?: string
    variable?: string
    imageUrl?: string
    chartType?: string
    badgeType?: string
    progressValue?: number | string
    shapeType?: string
    iconType?: string
    linkUrl?: string
    githubData?: string
  }
  visible: boolean
  locked: boolean
}

interface Widget {
  id?: string
  name: string
  elements: WidgetElement[]
  canvas: {
    width: number
    height: number
    backgroundColor: string
    theme: "dark" | "light"
    showGrid: boolean
    gridSize: number
    snapToGrid: boolean
  }
  isPrivate: boolean
  tags: string[]
  githubUsername?: string
}

interface GitHubUserData {
  login: string
  name: string
  bio: string
  followers: number
  following: number
  public_repos: number
  avatar_url: string
  created_at: string
  updated_at: string
}

// Premium Canvas Sizes inspired by top design tools
const CANVAS_SIZES = [
  { name: "GitHub Badge", width: 300, height: 120, description: "Perfect for profile badges", icon: "🏷️" },
  { name: "Stats Card", width: 400, height: 200, description: "Comprehensive stats display", icon: "📊" },
  { name: "Wide Banner", width: 600, height: 150, description: "Horizontal profile banner", icon: "🎯" },
  { name: "Square Card", width: 300, height: 300, description: "Balanced square format", icon: "⬜" },
  { name: "Large Display", width: 500, height: 300, description: "Detailed information panel", icon: "📱" },
  { name: "Custom", width: 400, height: 200, description: "Set your own dimensions", icon: "✨" },
]

// GitHub Variables
const GITHUB_VARIABLES = [
  { name: "username", description: "GitHub username", category: "Profile", placeholder: "{{username}}" },
  { name: "name", description: "Display name", category: "Profile", placeholder: "{{name}}" },
  { name: "bio", description: "User bio", category: "Profile", placeholder: "{{bio}}" },
  { name: "followers", description: "Number of followers", category: "Social", placeholder: "{{followers}}" },
  { name: "following", description: "Number of following", category: "Social", placeholder: "{{following}}" },
  {
    name: "public_repos",
    description: "Public repositories",
    category: "Repositories",
    placeholder: "{{public_repos}}",
  },
  { name: "avatar_url", description: "Profile picture URL", category: "Profile", placeholder: "{{avatar_url}}" },
  { name: "created_at", description: "Account creation date", category: "Profile", placeholder: "{{created_at}}" },
  {
    name: "totalCommitContributions",
    description: "Total commits",
    category: "Activity",
    placeholder: "{{totalCommitContributions}}",
  },
]

// Premium Element Categories with better organization
const ELEMENT_CATEGORIES = [
  {
    name: "Essentials",
    icon: "✨",
    elements: [
      { type: "text", icon: Type, label: "Text", color: "from-blue-500 to-blue-600", description: "Add dynamic text" },
      {
        type: "image",
        icon: ImageIcon,
        label: "Image",
        color: "from-green-500 to-green-600",
        description: "Insert images",
      },
      {
        type: "container",
        icon: Layers,
        label: "Container",
        color: "from-purple-500 to-purple-600",
        description: "Group elements",
      },
    ],
  },
  {
    name: "Shapes",
    icon: "🎨",
    elements: [
      {
        type: "shape",
        icon: Square,
        label: "Rectangle",
        color: "from-orange-500 to-orange-600",
        shapeType: "rectangle",
        description: "Basic rectangle",
      },
      {
        type: "shape",
        icon: Circle,
        label: "Circle",
        color: "from-pink-500 to-pink-600",
        shapeType: "circle",
        description: "Perfect circle",
      },
      {
        type: "shape",
        icon: Triangle,
        label: "Triangle",
        color: "from-yellow-500 to-yellow-600",
        shapeType: "triangle",
        description: "Triangle shape",
      },
      {
        type: "shape",
        icon: Star,
        label: "Star",
        color: "from-indigo-500 to-indigo-600",
        shapeType: "star",
        description: "Star shape",
      },
    ],
  },
  {
    name: "GitHub Data",
    icon: "📊",
    elements: [
      {
        type: "chart",
        icon: BarChart3,
        label: "Stats Chart",
        color: "from-cyan-500 to-cyan-600",
        description: "Visual statistics",
      },
      {
        type: "progress",
        icon: Zap,
        label: "Progress Bar",
        color: "from-emerald-500 to-emerald-600",
        description: "Progress indicator",
      },
      {
        type: "badge",
        icon: Hash,
        label: "Data Badge",
        color: "from-rose-500 to-rose-600",
        description: "Highlight metrics",
      },
      {
        type: "image",
        icon: Github,
        label: "Avatar",
        color: "from-gray-500 to-gray-600",
        githubData: "avatar",
        description: "Profile picture",
      },
    ],
  },
  {
    name: "Interactive",
    icon: "⚡",
    elements: [
      {
        type: "button",
        icon: Plus,
        label: "Button",
        color: "from-violet-500 to-violet-600",
        description: "Call-to-action",
      },
      {
        type: "qr",
        icon: Hash,
        label: "QR Code",
        color: "from-slate-500 to-slate-600",
        description: "QR code generator",
      },
    ],
  },
]

// Premium Draggable Element with Figma-inspired design
function PremiumDraggableElement({ type, icon: Icon, label, color, shapeType, githubData, description }: any) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "element",
    item: { elementType: type, shapeType, githubData },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={dragRef as any}
      className={`
        group relative flex items-center gap-4 p-4 rounded-xl border border-white/10 
        cursor-move hover:border-white/20 transition-all duration-300
        bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15
        backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10
        hover:scale-[1.02] active:scale-[0.98]
        ${isDragging ? "opacity-50 scale-95 rotate-2" : "opacity-100 scale-100"}
      `}
    >
      <div
        className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">{label}</div>
        <div className="text-xs text-white/60 truncate">{description}</div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Move className="w-4 h-4 text-white/40" />
      </div>
    </div>
  )
}

// Premium Inline Text Editor
function PremiumInlineTextEditor({
  element,
  onUpdate,
  onFinish,
}: {
  element: WidgetElement
  onUpdate: (element: WidgetElement) => void
  onFinish: () => void
}) {
  const [text, setText] = useState(element.content.text || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onUpdate({
        ...element,
        content: { ...element.content, text },
      })
      onFinish()
    } else if (e.key === "Escape") {
      onFinish()
    }
  }

  const handleBlur = () => {
    onUpdate({
      ...element,
      content: { ...element.content, text },
    })
    onFinish()
  }

  return (
    <input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-full h-full bg-transparent border-2 border-blue-400 rounded-lg px-3 text-center outline-none shadow-2xl shadow-blue-500/20 backdrop-blur-sm"
      style={{
        fontSize: element.style.fontSize,
        fontWeight: element.style.fontWeight,
        fontFamily: element.style.fontFamily,
        color: element.style.color,
      }}
    />
  )
}

// GitHub Data Fetcher
async function fetchGitHubData(username: string): Promise<GitHubUserData | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`)
    if (!response.ok) {
      throw new Error("User not found")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return null
  }
}

// Premium Canvas with Linear-inspired interactions
function PremiumCanvas({
  widget,
  onElementAdd,
  onElementSelect,
  onElementUpdate,
  selectedElements,
  zoom,
  onZoomChange,
  githubData,
  onWidgetUpdate,
}: {
  widget: Widget
  onElementAdd: (element: WidgetElement) => void
  onElementSelect: (elements: WidgetElement[]) => void
  onElementUpdate: (element: WidgetElement) => void
  selectedElements: WidgetElement[]
  zoom: number
  onZoomChange: (zoom: number) => void
  githubData: GitHubUserData | null
  onWidgetUpdate: (widget: Widget) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedElement, setDraggedElement] = useState<WidgetElement | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingElement, setEditingElement] = useState<string | null>(null)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [selectionBox, setSelectionBox] = useState<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    active: boolean
  }>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, active: false })

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "element",
    drop: (item: { elementType: string; shapeType?: string; githubData?: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        let x = Math.max(0, (offset.x - canvasRect.left - canvasOffset.x) / zoom)
        let y = Math.max(0, (offset.y - canvasRect.top - canvasOffset.y) / zoom)

        if (widget.canvas.snapToGrid) {
          x = Math.round(x / widget.canvas.gridSize) * widget.canvas.gridSize
          y = Math.round(y / widget.canvas.gridSize) * widget.canvas.gridSize
        }

        const newElement: WidgetElement = createNewElement(item.elementType, x, y, item.shapeType, item.githubData)
        onElementAdd(newElement)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsSpacePressed(true)
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        selectedElements.forEach((element) => {
          onWidgetUpdate({
            ...widget,
            elements: widget.elements.filter((el) => el.id !== element.id),
          })
        })
        onElementSelect([])
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c" && selectedElements.length > 0) {
          localStorage.setItem("copiedElements", JSON.stringify(selectedElements))
          toast.success(`Copied ${selectedElements.length} element(s)`, {
            icon: "📋",
          })
        }
        if (e.key === "v") {
          const copiedElements = localStorage.getItem("copiedElements")
          if (copiedElements) {
            const elements = JSON.parse(copiedElements) as WidgetElement[]
            elements.forEach((element, index) => {
              const newElement = {
                ...element,
                id: `element-${Date.now()}-${index}`,
                position: {
                  x: element.position.x + 20,
                  y: element.position.y + 20,
                },
              }
              onElementAdd(newElement)
            })
            toast.success(`Pasted ${elements.length} element(s)`, {
              icon: "📌",
            })
          }
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [selectedElements, widget, onElementAdd, onElementSelect, onWidgetUpdate])

  // Smooth mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta))
        onZoomChange(newZoom)
      }
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false })
      return () => canvas.removeEventListener("wheel", handleWheel)
    }
  }, [zoom, onZoomChange])

  const createNewElement = (
    type: string,
    x: number,
    y: number,
    shapeType?: string,
    githubData?: string,
  ): WidgetElement => {
    const baseElement = {
      id: `element-${Date.now()}`,
      position: { x, y },
      rotation: 0,
      visible: true,
      locked: false,
      style: {
        backgroundColor: widget.canvas.theme === "dark" ? "#1A1625" : "#F8F9FA",
        color: widget.canvas.theme === "dark" ? "#E2E8F0" : "#1A202C",
        fontSize: 14,
        fontWeight: "normal",
        fontFamily: "Inter",
        borderRadius: 4,
        borderWidth: 0,
        borderColor: "#E2E8F0",
        borderStyle: "solid",
        padding: 8,
        opacity: 1,
        zIndex: 1,
      },
      content: {
        githubData,
      },
    }

    switch (type) {
      case "text":
        return {
          ...baseElement,
          type: "text" as const,
          size: { width: 120, height: 32 },
          content: {
            ...baseElement.content,
            text: githubData ? "{{username}}" : "Sample Text",
          },
        }
      case "container":
        return {
          ...baseElement,
          type: "container" as const,
          size: { width: 200, height: 100 },
          style: {
            ...baseElement.style,
            backgroundColor: widget.canvas.theme === "dark" ? "#2D3748" : "#EDF2F7",
            borderWidth: 1,
          },
        }
      case "shape":
        return {
          ...baseElement,
          type: "shape" as const,
          size: { width: 60, height: 60 },
          content: {
            ...baseElement.content,
            shapeType: shapeType || "rectangle",
          },
          style: {
            ...baseElement.style,
            backgroundColor: "#3B82F6",
          },
        }
      case "progress":
        return {
          ...baseElement,
          type: "progress" as const,
          size: { width: 200, height: 20 },
          content: {
            ...baseElement.content,
            progressValue: githubData ? "{{followers}}" : 75,
          },
          style: {
            ...baseElement.style,
            backgroundColor: "#E5E7EB",
          },
        }
      case "badge":
        return {
          ...baseElement,
          type: "badge" as const,
          size: { width: 80, height: 24 },
          content: {
            ...baseElement.content,
            text: githubData ? "{{public_repos}}" : "Badge",
          },
          style: {
            ...baseElement.style,
            backgroundColor: "#3B82F6",
            color: "#FFFFFF",
            borderRadius: 12,
          },
        }
      case "button":
        return {
          ...baseElement,
          type: "button" as const,
          size: { width: 100, height: 36 },
          content: {
            ...baseElement.content,
            text: "Button",
          },
          style: {
            ...baseElement.style,
            backgroundColor: "#3B82F6",
            color: "#FFFFFF",
            borderRadius: 6,
          },
        }
      case "image":
        return {
          ...baseElement,
          type: "image" as const,
          size: { width: 80, height: 80 },
          content: {
            ...baseElement.content,
            imageUrl: githubData === "avatar" ? "{{avatar_url}}" : "/placeholder.svg?height=80&width=80",
          },
          style: {
            ...baseElement.style,
            borderRadius: githubData === "avatar" ? 40 : 4,
          },
        }
      case "chart":
        return {
          ...baseElement,
          type: "chart" as const,
          size: { width: 200, height: 120 },
          content: {
            ...baseElement.content,
            chartType: "bar",
            text: "GitHub Stats",
          },
          style: {
            ...baseElement.style,
            backgroundColor: "#1F2937",
            borderRadius: 8,
          },
        }
      default:
        return {
          ...baseElement,
          type: type as any,
          size: { width: 100, height: 40 },
        }
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
      return
    }

    if (!e.target || (e.target as HTMLElement).closest("[data-element-id]")) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const startX = (e.clientX - rect.left - canvasOffset.x) / zoom
      const startY = (e.clientY - rect.top - canvasOffset.y) / zoom
      setSelectionBox({
        start: { x: startX, y: startY },
        end: { x: startX, y: startY },
        active: true,
      })
    }
  }

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setCanvasOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
        return
      }

      if (selectionBox.active && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const endX = (e.clientX - rect.left - canvasOffset.x) / zoom
        const endY = (e.clientY - rect.top - canvasOffset.y) / zoom
        setSelectionBox((prev) => ({
          ...prev,
          end: { x: endX, y: endY },
        }))
      }

      if (!draggedElement || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      let newX = Math.max(0, (e.clientX - rect.left - canvasOffset.x) / zoom - dragOffset.x)
      let newY = Math.max(0, (e.clientY - rect.top - canvasOffset.y) / zoom - dragOffset.y)

      if (widget.canvas.snapToGrid) {
        newX = Math.round(newX / widget.canvas.gridSize) * widget.canvas.gridSize
        newY = Math.round(newY / widget.canvas.gridSize) * widget.canvas.gridSize
      }

      onElementUpdate({
        ...draggedElement,
        position: { x: newX, y: newY },
      })
    },
    [
      draggedElement,
      dragOffset,
      zoom,
      onElementUpdate,
      widget.canvas.snapToGrid,
      widget.canvas.gridSize,
      isPanning,
      panStart,
      canvasOffset,
      selectionBox.active,
    ],
  )

  const handleCanvasMouseUp = useCallback(() => {
    if (selectionBox.active) {
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x)
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x)
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y)
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y)

      const selectedInBox = widget.elements.filter((element) => {
        const elementCenterX = element.position.x + element.size.width / 2
        const elementCenterY = element.position.y + element.size.height / 2
        return elementCenterX >= minX && elementCenterX <= maxX && elementCenterY >= minY && elementCenterY <= maxY
      })

      onElementSelect(selectedInBox)
      setSelectionBox({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, active: false })
    }

    setDraggedElement(null)
    setIsPanning(false)
  }, [selectionBox, widget.elements, onElementSelect])

  useEffect(() => {
    if (draggedElement || isPanning || selectionBox.active) {
      document.addEventListener("mousemove", handleCanvasMouseMove)
      document.addEventListener("mouseup", handleCanvasMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleCanvasMouseMove)
        document.removeEventListener("mouseup", handleCanvasMouseUp)
      }
    }
  }, [draggedElement, isPanning, selectionBox.active, handleCanvasMouseMove, handleCanvasMouseUp])

  const handleElementMouseDown = (element: WidgetElement, e: React.MouseEvent) => {
    if (element.locked) return
    e.stopPropagation()

    if (!selectedElements.find((el) => el.id === element.id)) {
      if (e.ctrlKey || e.metaKey) {
        onElementSelect([...selectedElements, element])
      } else {
        onElementSelect([element])
      }
    }

    setDraggedElement(element)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left - canvasOffset.x) / zoom - element.position.x,
        y: (e.clientY - rect.top - canvasOffset.y) / zoom - element.position.y,
      })
    }
  }

  const handleElementDoubleClick = (element: WidgetElement, e: React.MouseEvent) => {
    e.stopPropagation()
    if (element.type === "text" || element.type === "badge" || element.type === "button") {
      setEditingElement(element.id)
    }
  }

  const getDisplayValue = (element: WidgetElement, field: string) => {
    if (githubData && element.content.text?.includes("{{")) {
      const placeholder = element.content.text
      switch (placeholder) {
        case "{{username}}":
          return githubData.login
        case "{{name}}":
          return githubData.name || githubData.login
        case "{{bio}}":
          return githubData.bio || "No bio available"
        case "{{followers}}":
          return githubData.followers.toString()
        case "{{following}}":
          return githubData.following.toString()
        case "{{public_repos}}":
          return githubData.public_repos.toString()
        case "{{created_at}}":
          return new Date(githubData.created_at).getFullYear().toString()
        case "{{totalCommitContributions}}":
          return "1,234" // Mock data for now
        default:
          return element.content.text
      }
    }
    return element.content.text
  }

  const getImageUrl = (element: WidgetElement) => {
    if (githubData && element.content.imageUrl === "{{avatar_url}}") {
      return githubData.avatar_url
    }
    return element.content.imageUrl
  }

  const getProgressValue = (element: WidgetElement) => {
    if (
      githubData &&
      typeof element.content.progressValue === "string" &&
      element.content.progressValue.includes("{{")
    ) {
      const placeholder = element.content.progressValue
      switch (placeholder) {
        case "{{followers}}":
          return Math.min(100, (githubData.followers / 100) * 100)
        case "{{public_repos}}":
          return Math.min(100, (githubData.public_repos / 50) * 100)
        default:
          return 75
      }
    }
    return typeof element.content.progressValue === "number" ? element.content.progressValue : 75
  }

  const renderGrid = () => {
    if (!widget.canvas.showGrid) return null

    const gridLines = []
    const gridSize = widget.canvas.gridSize * zoom
    const canvasWidth = widget.canvas.width * zoom
    const canvasHeight = widget.canvas.height * zoom

    for (let x = 0; x <= canvasWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={0.5}
        />,
      )
    }

    for (let y = 0; y <= canvasHeight; y += gridSize) {
      gridLines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={canvasWidth} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />,
      )
    }

    return (
      <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>
        {gridLines}
      </svg>
    )
  }

  const renderSelectionBox = () => {
    if (!selectionBox.active) return null

    const minX = Math.min(selectionBox.start.x, selectionBox.end.x)
    const maxX = Math.max(selectionBox.start.x, selectionBox.end.x)
    const minY = Math.min(selectionBox.start.y, selectionBox.end.y)
    const maxY = Math.max(selectionBox.start.y, selectionBox.end.y)

    return (
      <div
        className="absolute border-2 border-blue-400 bg-blue-400/5 pointer-events-none rounded-lg backdrop-blur-sm"
        style={{
          left: minX,
          top: minY,
          width: maxX - minX,
          height: maxY - minY,
        }}
      />
    )
  }

  const renderElement = (element: WidgetElement) => {
    if (!element.visible) return null

    const isSelected = selectedElements.some((el) => el.id === element.id)
    const isEditing = editingElement === element.id
    const transform = `rotate(${element.rotation}deg)`

    const elementProps = {
      "data-element-id": element.id,
      className: `
        absolute cursor-pointer transition-all duration-200 select-none
        ${
          isSelected
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent shadow-2xl shadow-blue-500/20"
            : "hover:ring-1 hover:ring-blue-300/30"
        }
        ${element.locked ? "cursor-not-allowed opacity-60" : "hover:shadow-lg"}
      `,
      style: {
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform,
        opacity: element.style.opacity,
        zIndex: element.style.zIndex || 1,
        ...element.style,
      },
      onMouseDown: (e: React.MouseEvent) => handleElementMouseDown(element, e),
      onDoubleClick: (e: React.MouseEvent) => handleElementDoubleClick(element, e),
    }

    switch (element.type) {
      case "text":
        return (
          <div key={element.id} {...elementProps}>
            {isEditing ? (
              <PremiumInlineTextEditor
                element={element}
                onUpdate={onElementUpdate}
                onFinish={() => setEditingElement(null)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  fontSize: element.style.fontSize,
                  fontWeight: element.style.fontWeight,
                  fontFamily: element.style.fontFamily,
                  color: element.style.color,
                }}
              >
                {getDisplayValue(element, "text")}
              </div>
            )}
          </div>
        )
      case "image":
        return (
          <div key={element.id} {...elementProps}>
            <img
              src={getImageUrl(element) || "/placeholder.svg"}
              alt="Element"
              className="w-full h-full object-cover"
              style={{
                borderRadius: element.style.borderRadius,
              }}
            />
          </div>
        )
      case "container":
        return (
          <div
            key={element.id}
            {...elementProps}
            style={{
              ...elementProps.style,
              border: `${element.style.borderWidth}px ${element.style.borderStyle} ${element.style.borderColor}`,
              borderRadius: element.style.borderRadius,
            }}
          />
        )
      case "shape":
        return (
          <div key={element.id} {...elementProps}>
            {element.content.shapeType === "circle" && (
              <div className="w-full h-full rounded-full" style={{ backgroundColor: element.style.backgroundColor }} />
            )}
            {element.content.shapeType === "rectangle" && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: element.style.backgroundColor,
                  borderRadius: element.style.borderRadius,
                }}
              />
            )}
            {element.content.shapeType === "triangle" && (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: `${element.size.width / 2}px solid transparent`,
                  borderRight: `${element.size.width / 2}px solid transparent`,
                  borderBottom: `${element.size.height}px solid ${element.style.backgroundColor}`,
                }}
              />
            )}
          </div>
        )
      case "progress":
        return (
          <div key={element.id} {...elementProps}>
            <div className="w-full h-full rounded-full overflow-hidden" style={{ backgroundColor: "#E5E7EB" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${getProgressValue(element)}%`,
                  backgroundColor: element.style.backgroundColor,
                }}
              />
            </div>
          </div>
        )
      case "badge":
        return (
          <div key={element.id} {...elementProps}>
            {isEditing ? (
              <PremiumInlineTextEditor
                element={element}
                onUpdate={onElementUpdate}
                onFinish={() => setEditingElement(null)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: element.style.backgroundColor,
                  color: element.style.color,
                  borderRadius: element.style.borderRadius,
                }}
              >
                {getDisplayValue(element, "text")}
              </div>
            )}
          </div>
        )
      case "button":
        return (
          <div key={element.id} {...elementProps}>
            {isEditing ? (
              <PremiumInlineTextEditor
                element={element}
                onUpdate={onElementUpdate}
                onFinish={() => setEditingElement(null)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: element.style.backgroundColor,
                  color: element.style.color,
                  borderRadius: element.style.borderRadius,
                }}
              >
                {getDisplayValue(element, "text")}
              </div>
            )}
          </div>
        )
      case "chart":
        return (
          <div key={element.id} {...elementProps}>
            <div
              className="w-full h-full flex items-center justify-center text-sm font-medium rounded"
              style={{
                backgroundColor: element.style.backgroundColor,
                color: element.style.color,
                borderRadius: element.style.borderRadius,
              }}
            >
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-xs">GitHub Stats</div>
                {githubData && (
                  <div className="text-xs mt-1 space-y-1">
                    <div>Repos: {githubData.public_repos}</div>
                    <div>Followers: {githubData.followers}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      default:
        return <div key={element.id} {...elementProps} />
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Premium Floating Toolbar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onWidgetUpdate({ ...widget, canvas: { ...widget.canvas, showGrid: !widget.canvas.showGrid } })
              }
              className={`text-white hover:bg-white/10 rounded-xl transition-all duration-200 ${widget.canvas.showGrid ? "bg-white/20" : ""}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onWidgetUpdate({ ...widget, canvas: { ...widget.canvas, snapToGrid: !widget.canvas.snapToGrid } })
              }
              className={`text-white hover:bg-white/10 rounded-xl transition-all duration-200 ${widget.canvas.snapToGrid ? "bg-white/20" : ""}`}
            >
              <Target className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-white/20" />

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 rounded-xl">
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 rounded-xl">
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 rounded-xl">
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-white/20" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onZoomChange(Math.max(0.1, zoom - 0.25))}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="bg-black/20 border border-white/20 rounded-xl px-3 py-1 text-white text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onZoomChange(Math.min(5, zoom + 0.25))}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onZoomChange(1)}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="w-full h-full flex items-center justify-center p-8"
        style={{ cursor: isSpacePressed ? "grab" : isPanning ? "grabbing" : "default" }}
      >
        <div
          ref={dropRef as any}
          className={`
            relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl
            ${isOver ? "border-blue-400 bg-blue-500/5 shadow-blue-500/20" : "border-white/10"}
          `}
          style={{
            width: widget.canvas.width * zoom,
            height: widget.canvas.height * zoom,
            backgroundColor: widget.canvas.backgroundColor,
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          }}
          onMouseDown={handleCanvasMouseDown}
        >
          <div ref={canvasRef} className="relative w-full h-full">
            {renderGrid()}
            {widget.elements.sort((a, b) => (a.style.zIndex || 1) - (b.style.zIndex || 1)).map(renderElement)}
            {renderSelectionBox()}
          </div>
        </div>
      </div>

      {/* Premium Help Panel */}
      <div className="absolute bottom-6 left-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white text-xs shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded-lg font-mono">Space</kbd>
            <span className="text-white/70">+ drag to pan canvas</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded-lg font-mono">⌘</kbd>
            <span className="text-white/70">+ wheel to zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded-lg font-mono">⌘C/V</kbd>
            <span className="text-white/70">copy/paste elements</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-white/20 px-2 py-1 rounded-lg font-mono">Del</kbd>
            <span className="text-white/70">delete selected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Premium Properties Panel with Notion-inspired design
function PremiumPropertiesPanel({
  selectedElements,
  onElementUpdate,
  onElementDelete,
  widget,
  isVisible,
  onToggleVisibility,
  onWidgetUpdate,
  githubData,
  onFetchGitHubData,
}: {
  selectedElements: WidgetElement[]
  onElementUpdate: (element: WidgetElement) => void
  onElementDelete: (elementId: string) => void
  widget: Widget
  isVisible: boolean
  onToggleVisibility: () => void
  onWidgetUpdate: (widget: Widget) => void
  githubData: GitHubUserData | null
  onFetchGitHubData: (username: string) => void
}) {
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const selectedElement = selectedElements[0]

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      const maxX = window.innerWidth - 500
      const maxY = window.innerHeight - 400
      setPanelPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    },
    [isDragging, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!selectedElement) return null

  const updateElement = (updates: Partial<WidgetElement>) => {
    onElementUpdate({ ...selectedElement, ...updates })
  }

  const updateStyle = (styleUpdates: Partial<WidgetElement["style"]>) => {
    updateElement({
      style: { ...selectedElement.style, ...styleUpdates },
    })
  }

  const updateContent = (contentUpdates: Partial<WidgetElement["content"]>) => {
    updateElement({
      content: { ...selectedElement.content, ...contentUpdates },
    })
  }

  return (
    <>
      {/* Premium Toggle Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={onToggleVisibility}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl w-14 h-14 shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-110"
        >
          {isVisible ? <ChevronDown className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
        </Button>
      </div>

      {/* Premium Properties Panel */}
      {isVisible && (
        <div
          ref={panelRef}
          className="fixed z-40"
          style={{
            left: panelPosition.x || "50%",
            top: panelPosition.y || "auto",
            bottom: panelPosition.y ? "auto" : "100px",
            transform: panelPosition.x ? "none" : "translateX(-50%)",
          }}
        >
          <Card className="bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl min-w-[500px] max-w-[700px] rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="cursor-move p-2 hover:bg-white/10 rounded-xl transition-colors"
                    onMouseDown={handleMouseDown}
                  >
                    <GripVertical className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg font-semibold">
                      {selectedElements.length > 1
                        ? `${selectedElements.length} Elements Selected`
                        : `${selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties`}
                    </CardTitle>
                    <p className="text-white/60 text-sm mt-1">Customize your element</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateElement({ visible: !selectedElement.visible })}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    {selectedElement.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateElement({ locked: !selectedElement.locked })}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onElementDelete(selectedElement.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onToggleVisibility}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[500px] overflow-y-auto">
              <Tabs defaultValue="transform" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/20 rounded-xl p-1">
                  <TabsTrigger value="transform" className="text-white data-[state=active]:bg-blue-600 rounded-lg">
                    <Move className="w-4 h-4 mr-2" />
                    Transform
                  </TabsTrigger>
                  <TabsTrigger value="style" className="text-white data-[state=active]:bg-blue-600 rounded-lg">
                    <Palette className="w-4 h-4 mr-2" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-white data-[state=active]:bg-blue-600 rounded-lg">
                    <Type className="w-4 h-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="github" className="text-white data-[state=active]:bg-blue-600 rounded-lg">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transform" className="space-y-6 mt-6">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-sm text-white/80 font-medium">X Position</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.position.x)}
                        onChange={(e) =>
                          updateElement({
                            position: { ...selectedElement.position, x: Number(e.target.value) || 0 },
                          })
                        }
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Y Position</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.position.y)}
                        onChange={(e) =>
                          updateElement({
                            position: { ...selectedElement.position, y: Number(e.target.value) || 0 },
                          })
                        }
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Width</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.size.width)}
                        onChange={(e) =>
                          updateElement({
                            size: { ...selectedElement.size, width: Number(e.target.value) || 0 },
                          })
                        }
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Height</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.size.height)}
                        onChange={(e) =>
                          updateElement({
                            size: { ...selectedElement.size, height: Number(e.target.value) || 0 },
                          })
                        }
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-white/80 font-medium">Rotation</Label>
                    <div className="mt-3">
                      <Slider
                        value={[selectedElement.rotation]}
                        onValueChange={([value]) => updateElement({ rotation: value })}
                        min={-180}
                        max={180}
                        step={1}
                        className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                      />
                      <div className="flex justify-between text-xs text-white/50 mt-2">
                        <span>-180°</span>
                        <span className="font-medium text-white">{selectedElement.rotation}°</span>
                        <span>180°</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-white/80 font-medium">Layer Order</Label>
                    <Input
                      type="number"
                      value={selectedElement.style.zIndex || 1}
                      onChange={(e) => updateStyle({ zIndex: Number(e.target.value) || 1 })}
                      className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      min="1"
                      max="100"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Background Color</Label>
                      <div className="flex gap-3 mt-2">
                        <Input
                          type="color"
                          value={selectedElement.style.backgroundColor || "#000000"}
                          onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                          className="w-14 h-10 p-1 bg-black/20 border-white/20 rounded-xl"
                        />
                        <Input
                          value={selectedElement.style.backgroundColor || ""}
                          onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                          placeholder="#000000"
                          className="bg-black/20 border-white/20 text-white text-sm rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Text Color</Label>
                      <div className="flex gap-3 mt-2">
                        <Input
                          type="color"
                          value={selectedElement.style.color || "#ffffff"}
                          onChange={(e) => updateStyle({ color: e.target.value })}
                          className="w-14 h-10 p-1 bg-black/20 border-white/20 rounded-xl"
                        />
                        <Input
                          value={selectedElement.style.color || ""}
                          onChange={(e) => updateStyle({ color: e.target.value })}
                          placeholder="#ffffff"
                          className="bg-black/20 border-white/20 text-white text-sm rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-white/80 font-medium">Border Radius</Label>
                    <div className="mt-3">
                      <Slider
                        value={[selectedElement.style.borderRadius || 0]}
                        onValueChange={([value]) => updateStyle({ borderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                        className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                      />
                      <div className="flex justify-between text-xs text-white/50 mt-2">
                        <span>0px</span>
                        <span className="font-medium text-white">{selectedElement.style.borderRadius || 0}px</span>
                        <span>50px</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-white/80 font-medium">Opacity</Label>
                    <div className="mt-3">
                      <Slider
                        value={[selectedElement.style.opacity || 1]}
                        onValueChange={([value]) => updateStyle({ opacity: value })}
                        min={0}
                        max={1}
                        step={0.1}
                        className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                      />
                      <div className="flex justify-between text-xs text-white/50 mt-2">
                        <span>0%</span>
                        <span className="font-medium text-white">
                          {Math.round((selectedElement.style.opacity || 1) * 100)}%
                        </span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  {(selectedElement.type === "text" ||
                    selectedElement.type === "badge" ||
                    selectedElement.type === "button") && (
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Font Size</Label>
                      <div className="mt-3">
                        <Slider
                          value={[selectedElement.style.fontSize || 14]}
                          onValueChange={([value]) => updateStyle({ fontSize: value })}
                          min={8}
                          max={72}
                          step={1}
                          className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                        />
                        <div className="flex justify-between text-xs text-white/50 mt-2">
                          <span>8px</span>
                          <span className="font-medium text-white">{selectedElement.style.fontSize || 14}px</span>
                          <span>72px</span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  {(selectedElement.type === "text" ||
                    selectedElement.type === "badge" ||
                    selectedElement.type === "button") && (
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Text Content</Label>
                      <Input
                        value={selectedElement.content.text || ""}
                        onChange={(e) => updateContent({ text: e.target.value })}
                        placeholder="Enter text..."
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                      <p className="text-xs text-white/50 mt-2">💡 Tip: Double-click element to edit inline</p>
                    </div>
                  )}
                  {selectedElement.type === "image" && (
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Image URL</Label>
                      <Input
                        value={selectedElement.content.imageUrl || ""}
                        onChange={(e) => updateContent({ imageUrl: e.target.value })}
                        placeholder="Enter image URL or use {{avatar_url}}"
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                    </div>
                  )}
                  {selectedElement.type === "progress" && (
                    <div>
                      <Label className="text-sm text-white/80 font-medium">Progress Value</Label>
                      <Input
                        value={selectedElement.content.progressValue?.toString() || ""}
                        onChange={(e) =>
                          updateContent({
                            progressValue: e.target.value.includes("{{") ? e.target.value : Number(e.target.value),
                          })
                        }
                        placeholder="Enter value or use {{followers}}"
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="github" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-semibold text-lg">GitHub Integration</Label>
                      {githubData && (
                        <Badge variant="secondary" className="bg-green-600 text-white px-3 py-1 rounded-full">
                          ✓ Connected: {githubData.login}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Input
                        value={widget.githubUsername || ""}
                        onChange={(e) => onWidgetUpdate({ ...widget, githubUsername: e.target.value })}
                        placeholder="Enter GitHub username"
                        className="bg-black/20 border-white/20 text-white h-10 rounded-xl"
                      />
                      <Button
                        size="sm"
                        onClick={() => widget.githubUsername && onFetchGitHubData(widget.githubUsername)}
                        disabled={!widget.githubUsername}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    {githubData && (
                      <div className="text-sm text-white/70 bg-black/20 p-4 rounded-xl border border-white/10">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex justify-between">
                            <span>Name:</span>
                            <span className="text-white font-medium">{githubData.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Username:</span>
                            <span className="text-white font-medium">{githubData.login}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Followers:</span>
                            <span className="text-white font-medium">{githubData.followers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Following:</span>
                            <span className="text-white font-medium">{githubData.following}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Repos:</span>
                            <span className="text-white font-medium">{githubData.public_repos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Joined:</span>
                            <span className="text-white font-medium">
                              {new Date(githubData.created_at).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-white/80 font-medium">GitHub Variables</Label>
                      <Select
                        onValueChange={(value) => {
                          const variable = GITHUB_VARIABLES.find((v) => v.name === value)
                          if (variable) {
                            if (selectedElement.type === "image" && value === "avatar_url") {
                              updateContent({ imageUrl: variable.placeholder })
                            } else if (
                              selectedElement.type === "progress" &&
                              (value === "followers" || value === "public_repos")
                            ) {
                              updateContent({ progressValue: variable.placeholder })
                            } else {
                              updateContent({ text: variable.placeholder, variable: value })
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="bg-black/20 border-white/20 text-white h-10 rounded-xl mt-2">
                          <SelectValue placeholder="Select GitHub variable" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1625] border-white/20 rounded-xl">
                          {GITHUB_VARIABLES.map((variable) => (
                            <SelectItem key={variable.name} value={variable.name} className="text-white">
                              <div className="py-1">
                                <div className="font-medium">{variable.name}</div>
                                <div className="text-xs text-white/70">{variable.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Enhanced SVG Generator with proper content extraction
function generatePremiumSVG(widget: Widget): string {
  let svgContent = ""

  // Sort elements by z-index and render
  widget.elements
    .filter((element) => element.visible)
    .sort((a, b) => (a.style.zIndex || 1) - (b.style.zIndex || 1))
    .forEach((element) => {
      const transform =
        element.rotation !== 0
          ? ` transform="rotate(${element.rotation} ${element.position.x + element.size.width / 2} ${element.position.y + element.size.height / 2})"`
          : ""

      const opacity = element.style.opacity !== 1 ? ` opacity="${element.style.opacity || 1}"` : ""

      if (element.type === "text" || element.type === "badge" || element.type === "button") {
        const textContent = element.content.text || ""
        svgContent += `<text x="${element.position.x + element.size.width / 2}" y="${element.position.y + element.size.height / 2 + (element.style.fontSize || 14) / 3}" fill="${element.style.color}" fontSize="${element.style.fontSize}" fontWeight="${element.style.fontWeight || "normal"}" textAnchor="middle"${opacity}${transform}>${textContent}</text>`
      }
    })

  return svgContent
}

// History management for undo/redo
function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  const pushState = useCallback(
    (newState: T) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push(newState)
        return newHistory.slice(-50)
      })
      setCurrentIndex((prev) => Math.min(prev + 1, 49))
    },
    [currentIndex],
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1]
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1]
    }
    return null
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return { pushState, undo, redo, canUndo, canRedo, currentState: history[currentIndex] }
}

// Cookie utility
const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null
  try {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length)
      }
    }
    return null
  } catch (error) {
    console.error(`Failed to retrieve cookie ${name}:`, error)
    return null
  }
}

// Main Premium Widget Builder Component
export default function PremiumWidgetBuilder() {
  const [showInitialModal, setShowInitialModal] = useState(true)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedCanvasSize, setSelectedCanvasSize] = useState<(typeof CANVAS_SIZES)[0]>(CANVAS_SIZES[1])
  const [customWidth, setCustomWidth] = useState(400)
  const [customHeight, setCustomHeight] = useState(200)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Essentials"])
  const [selectedElements, setSelectedElements] = useState<WidgetElement[]>([])
  const [zoom, setZoom] = useState(1)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [githubData, setGithubData] = useState<GitHubUserData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [svgContent, setSvgContent] = useState("")

  const [currentWidget, setCurrentWidget] = useState<Widget>({
    name: "My Widget",
    elements: [],
    canvas: {
      width: 400,
      height: 200,
      backgroundColor: "#0F0C14",
      theme: "dark",
      showGrid: true,
      gridSize: 10,
      snapToGrid: false,
    },
    isPrivate: false,
    tags: [],
    githubUsername: "",
  })

  const { pushState, undo, redo, canUndo, canRedo } = useHistory({
    elements: currentWidget.elements,
    canvas: currentWidget.canvas,
  })

  const { user } = useAuth()
  const router = useRouter()

  // Update SVG content in real-time
  useEffect(() => {
    setSvgContent(generatePremiumSVG(currentWidget))
  }, [currentWidget])

  // Save state to history when elements change
  useEffect(() => {
    pushState({
      elements: currentWidget.elements,
      canvas: currentWidget.canvas,
    })
  }, [currentWidget.elements, currentWidget.canvas, pushState])

  const handleUndo = () => {
    const prevState = undo()
    if (prevState) {
      setCurrentWidget((prev) => ({
        ...prev,
        elements: prevState.elements,
        canvas: prevState.canvas,
      }))
    }
  }

  const handleRedo = () => {
    const nextState = redo()
    if (nextState) {
      setCurrentWidget((prev) => ({
        ...prev,
        elements: nextState.elements,
        canvas: nextState.canvas,
      }))
    }
  }

  const handleFetchGitHubData = async (username: string) => {
    try {
      const data = await fetchGitHubData(username)
      if (data) {
        setGithubData(data)
        toast.success(`🎉 GitHub data loaded for ${username}`, {
          description: `Found ${data.public_repos} repos and ${data.followers} followers`,
        })
      } else {
        toast.error("❌ Failed to fetch GitHub data")
      }
    } catch (error) {
      toast.error("❌ Error fetching GitHub data")
    }
  }

  const handleCanvasSizeSelect = (size: (typeof CANVAS_SIZES)[0]) => {
    setSelectedCanvasSize(size)
    if (size.name !== "Custom") {
      setCurrentWidget((prev) => ({
        ...prev,
        canvas: { ...prev.canvas, width: size.width, height: size.height },
      }))
    }
    setShowInitialModal(false)
  }

  const handleCustomSizeApply = () => {
    setCurrentWidget((prev) => ({
      ...prev,
      canvas: { ...prev.canvas, width: customWidth, height: customHeight },
    }))
    setShowInitialModal(false)
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName],
    )
  }

  const addElement = (element: WidgetElement) => {
    setCurrentWidget((prev) => ({
      ...prev,
      elements: [...prev.elements, element],
    }))
    setSelectedElements([element])
    toast.success(`✨ Added ${element.type} element`, {
      description: "Double-click to edit inline",
    })
  }

  const updateElement = (updatedElement: WidgetElement) => {
    setCurrentWidget((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el)),
    }))
    setSelectedElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
  }

  const deleteElement = (elementId: string) => {
    setCurrentWidget((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }))
    setSelectedElements((prev) => prev.filter((el) => el.id !== elementId))
    toast.success("🗑️ Element deleted")
  }

  const toggleCanvasTheme = () => {
    setCurrentWidget((prev) => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        theme: prev.canvas.theme === "dark" ? "light" : "dark",
        backgroundColor: prev.canvas.theme === "dark" ? "#FFFFFF" : "#0F0C14",
      },
    }))
  }

  const handleElementClick = (elementType: any) => {
    const centerX = currentWidget.canvas.width / 2 - 50
    const centerY = currentWidget.canvas.height / 2 - 25
    const newElement: WidgetElement = {
      id: `element-${Date.now()}`,
      type: elementType.type,
      position: { x: centerX, y: centerY },
      size: { width: 100, height: 40 },
      rotation: 0,
      style: {
        backgroundColor: currentWidget.canvas.theme === "dark" ? "#1A1625" : "#F8F9FA",
        color: currentWidget.canvas.theme === "dark" ? "#E2E8F0" : "#1A202C",
        fontSize: 14,
        fontWeight: "normal",
        fontFamily: "Inter",
        borderRadius: 4,
        borderWidth: 0,
        borderColor: "#E2E8F0",
        borderStyle: "solid",
        padding: 8,
        opacity: 1,
        zIndex: 1,
      },
      content: {
        text:
          elementType.type === "text"
            ? elementType.githubData
              ? "{{username}}"
              : "Sample Text"
            : elementType.type === "badge"
              ? elementType.githubData
                ? "{{public_repos}}"
                : "Badge"
              : elementType.type === "button"
                ? "Button"
                : undefined,
        shapeType: elementType.shapeType,
        githubData: elementType.githubData,
        imageUrl: elementType.githubData === "avatar" ? "{{avatar_url}}" : undefined,
      },
      visible: true,
      locked: false,
    }
    addElement(newElement)
  }

  const handleSave = async () => {
    if (!currentWidget.name.trim() || currentWidget.elements.length === 0) {
      toast.error("❌ Please provide a name and add elements to your widget")
      return
    }

    setIsSaving(true)
    try {
      const accessToken = getCookie("devboard_access_token")
      if (!accessToken) {
        toast.error("🔐 Please log in to save widgets")
        return
      }

      // Format data according to backend expectations
      const saveData = {
        name: currentWidget.name,
        content: svgContent, // Just the SVG content, not full SVG
        size: {
          width: currentWidget.canvas.width,
          height: currentWidget.canvas.height,
        },
        isPrivate: currentWidget.isPrivate,
        Tags: currentWidget.tags, // Capital T as expected by backend
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/widget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(saveData),
      })

      if (response.ok) {
        const savedWidget = await response.json()
        setCurrentWidget((prev) => ({ ...prev, id: savedWidget.id }))
        toast.success("🎉 Widget saved successfully!", {
          description: "Your widget is now available in your dashboard",
        })
      } else {
        const errorText = await response.text()
        console.error("Save error response:", errorText)
        try {
          const error = JSON.parse(errorText)
          toast.error(`❌ ${error.message || "Failed to save widget"}`)
        } catch {
          toast.error("❌ Failed to save widget - Invalid response format")
        }
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("❌ Failed to save widget - Network error")
    } finally {
      setIsSaving(false)
      setShowSaveModal(false)
    }
  }

  const copyWidgetCode = () => {
    const fullSVG = `<svg width="${currentWidget.canvas.width}" height="${currentWidget.canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${currentWidget.canvas.width}" height="${currentWidget.canvas.height}" fill="${currentWidget.canvas.backgroundColor}" rx="8"/>
  ${svgContent}
</svg>`
    navigator.clipboard.writeText(fullSVG)
    toast.success("📋 SVG code copied to clipboard!", {
      description: "Ready to use in your projects",
    })
  }

  const addTag = (tag: string) => {
    if (tag && !currentWidget.tags.includes(tag)) {
      setCurrentWidget((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCurrentWidget((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-gradient-to-br from-[#0F0C14] via-[#1A1625] to-[#0F0C14] text-white pt-16 overflow-hidden">
        {/* Premium Initial Canvas Size Modal */}
        <Dialog open={showInitialModal} onOpenChange={setShowInitialModal}>
          <DialogContent className="bg-black/20 backdrop-blur-2xl border border-white/10 text-white max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                ✨ Create Your Perfect Widget
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xl">
                Choose the ideal canvas size for your GitHub widget masterpiece
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-10">
              {CANVAS_SIZES.map((size) => (
                <Card
                  key={size.name}
                  className={`cursor-pointer transition-all duration-500 bg-black/10 border-white/10 hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-105 rounded-2xl ${
                    selectedCanvasSize.name === size.name
                      ? "border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-105"
                      : ""
                  }`}
                  onClick={() => setSelectedCanvasSize(size)}
                >
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{size.icon}</div>
                      <div
                        className="mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl border-2 border-blue-400/30 shadow-2xl"
                        style={{
                          width: Math.min(size.width / 2.5, 140),
                          height: Math.min(size.height / 2.5, 90),
                        }}
                      />
                      <h3 className="font-bold text-white text-xl mb-2">{size.name}</h3>
                      <p className="text-sm text-blue-400 font-semibold mb-3">
                        {size.width} × {size.height}
                      </p>
                      <p className="text-xs text-gray-400">{size.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedCanvasSize.name === "Custom" && (
              <div className="mt-10 p-8 bg-black/10 rounded-2xl border border-white/10">
                <h4 className="text-2xl font-bold mb-8 text-blue-400">✨ Custom Dimensions</h4>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <Label className="text-white text-lg font-semibold">Width (px)</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="bg-black/20 border-white/20 text-white mt-3 h-12 text-lg rounded-xl"
                      min="100"
                      max="1200"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-lg font-semibold">Height (px)</Label>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="bg-black/20 border-white/20 text-white mt-3 h-12 text-lg rounded-xl"
                      min="100"
                      max="800"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-6 mt-10">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-black/20 border-white/20 hover:bg-black/40 text-white px-8 py-3 text-lg rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                onClick={
                  selectedCanvasSize.name === "Custom"
                    ? handleCustomSizeApply
                    : () => handleCanvasSizeSelect(selectedCanvasSize)
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-3 text-lg rounded-xl shadow-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Widget
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Premium Save Modal */}
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
          <DialogContent className="bg-black/20 backdrop-blur-2xl border border-white/10 text-white max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-400">💾 Save Your Widget</DialogTitle>
              <DialogDescription className="text-gray-400 text-lg">
                Configure your widget settings before saving
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-8 mt-8">
              <div>
                <Label className="text-white font-semibold text-lg">Widget Name</Label>
                <Input
                  value={currentWidget.name}
                  onChange={(e) => setCurrentWidget((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-black/20 border-white/20 text-white mt-3 h-12 text-lg rounded-xl"
                  placeholder="Enter widget name"
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/10">
                <div>
                  <Label className="text-white font-semibold text-lg">🔒 Make Private</Label>
                  <p className="text-sm text-gray-400 mt-2">Only you can see and use this widget</p>
                </div>
                <Switch
                  checked={currentWidget.isPrivate}
                  onCheckedChange={(checked) => setCurrentWidget((prev) => ({ ...prev, isPrivate: checked }))}
                  className="data-[state=checked]:bg-blue-600 scale-125"
                />
              </div>
              <div>
                <Label className="text-white font-semibold text-lg">🏷️ Tags</Label>
                <div className="flex flex-wrap gap-3 mt-4 mb-4">
                  {currentWidget.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors px-4 py-2 text-sm rounded-full"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addTag}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Add a tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1625] border-white/20 rounded-xl">
                    <SelectItem value="stats">📊 Stats</SelectItem>
                    <SelectItem value="social">👥 Social</SelectItem>
                    <SelectItem value="contributions">📈 Contributions</SelectItem>
                    <SelectItem value="repositories">📚 Repositories</SelectItem>
                    <SelectItem value="profile">👤 Profile</SelectItem>
                    <SelectItem value="followers">❤️ Followers</SelectItem>
                    <SelectItem value="commits">💻 Commits</SelectItem>
                    <SelectItem value="activity">⚡ Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-10">
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(false)}
                className="bg-black/20 border-white/20 hover:bg-black/40 text-white px-6 py-3 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-2xl"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Widget
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Premium Main Interface */}
        <div className="h-[calc(100vh-64px)] flex">
          {/* Premium Left Sidebar */}
          <div className="w-96 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">🎨 Elements</h2>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={toggleCanvasTheme}
                    variant="outline"
                    className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
                  >
                    {currentWidget.canvas.theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {ELEMENT_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="text-white font-semibold text-lg">{category.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-white/70 transition-transform duration-300 ${
                            expandedCategories.includes(category.name) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedCategories.includes(category.name) && (
                        <div className="space-y-4 mt-4 pl-4">
                          {category.elements.map((elementType) => (
                            <div
                              key={`${elementType.type}-${(elementType as any).shapeType || (elementType as any).githubData || "default"}`}
                              className="flex gap-3"
                            >
                              <PremiumDraggableElement {...elementType} />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleElementClick(elementType)}
                                className="text-white/70 hover:text-white hover:bg-white/10 px-3 rounded-xl"
                              >
                                <Plus className="w-5 h-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">📚 Layers</h3>
                <div className="text-sm text-white/50 bg-black/20 px-3 py-1 rounded-full">
                  {currentWidget.elements.length} element{currentWidget.elements.length !== 1 ? "s" : ""}
                </div>
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {currentWidget.elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedElements.some((el) => el.id === element.id)
                          ? "bg-blue-600/20 border border-blue-400/30 shadow-2xl shadow-blue-500/20"
                          : "hover:bg-white/5"
                      }`}
                      onClick={() => setSelectedElements([element])}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg" />
                        <div>
                          <span className="text-sm text-white font-semibold">
                            {element.type.charAt(0).toUpperCase() + element.type.slice(1)} {index + 1}
                          </span>
                          {element.content.text && (
                            <div className="text-xs text-white/50 truncate max-w-[140px] mt-1">
                              {element.content.text}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateElement({ ...element, visible: !element.visible })
                          }}
                          className="text-white/50 hover:text-white p-2 h-8 w-8 rounded-lg"
                        >
                          {element.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateElement({ ...element, locked: !element.locked })
                          }}
                          className="text-white/50 hover:text-white p-2 h-8 w-8 rounded-lg"
                        >
                          {element.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Premium Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Premium Header */}
            <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-2xl border-b border-white/10">
              <div className="flex items-center gap-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ✨ Premium Widget Builder
                </h1>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-xl"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-xl"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={copyWidgetCode}
                  variant="outline"
                  className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy SVG
                </Button>
                <Button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-2xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Widget
                </Button>
              </div>
            </div>

            {/* Premium Canvas */}
            <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <PremiumCanvas
                widget={currentWidget}
                onElementAdd={addElement}
                onElementSelect={setSelectedElements}
                onElementUpdate={updateElement}
                selectedElements={selectedElements}
                zoom={zoom}
                onZoomChange={setZoom}
                githubData={githubData}
                onWidgetUpdate={setCurrentWidget}
              />
            </div>
          </div>

          {/* Premium Right Sidebar - SVG Code */}
          <div className="w-96 bg-black/20 backdrop-blur-2xl border-l border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">💻 SVG Output</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyWidgetCode}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-2">Live preview • Auto-generated • Production ready</p>
            </div>
            <div className="flex-1 p-6">
              <ScrollArea className="h-full">
                <pre className="text-xs bg-black/20 p-6 rounded-2xl border border-white/10 text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                  <code>{`<svg width="${currentWidget.canvas.width}" height="${currentWidget.canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${currentWidget.canvas.width}" height="${currentWidget.canvas.height}" fill="${currentWidget.canvas.backgroundColor}" rx="8"/>
  ${svgContent}
</svg>`}</code>
                </pre>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Premium Floating Properties Panel */}
        <PremiumPropertiesPanel
          selectedElements={selectedElements}
          onElementUpdate={updateElement}
          onElementDelete={deleteElement}
          widget={currentWidget}
          isVisible={showPropertiesPanel}
          onToggleVisibility={() => setShowPropertiesPanel(!showPropertiesPanel)}
          onWidgetUpdate={setCurrentWidget}
          githubData={githubData}
          onFetchGitHubData={handleFetchGitHubData}
        />
      </main>
    </DndProvider>
  )
}
