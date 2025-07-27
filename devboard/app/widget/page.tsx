"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Save,
  Copy,
  ArrowLeft,
  RefreshCw,
  Type,
  Square,
  Circle,
  Star,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  BookOpen,
  User,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Grid3X3,
  Target,
  ChevronDown,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Smile,
} from "lucide-react"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

// GitHub Variables with detailed information
const GITHUB_VARIABLES = [
  {
    name: "totalCommitContributions",
    label: "Total Commits",
    description: "Total number of commits made by the user",
    category: "Contributions",
    icon: GitCommit,
    example: "1,234",
    emoji: "💻",
  },
  {
    name: "totalIssueContributions",
    label: "Total Issues",
    description: "Total issues created or contributed to",
    category: "Contributions",
    icon: AlertCircle,
    example: "89",
    emoji: "🐛",
  },
  {
    name: "totalPullRequestContributions",
    label: "Total Pull Requests",
    description: "Total pull requests created",
    category: "Contributions",
    icon: GitPullRequest,
    example: "156",
    emoji: "🔀",
  },
  {
    name: "totalRepositoriesWithContributedCommits",
    label: "Contributed Repositories",
    description: "Number of repositories with contributions",
    category: "Repositories",
    icon: BookOpen,
    example: "42",
    emoji: "📚",
  },
  {
    name: "totalStars",
    label: "Total Stars",
    description: "Total stars received across all repositories",
    category: "Repositories",
    icon: Star,
    example: "2,567",
    emoji: "⭐",
  },
  {
    name: "totalRepositories",
    label: "Total Repositories",
    description: "Total number of repositories owned",
    category: "Repositories",
    icon: BookOpen,
    example: "78",
    emoji: "📁",
  },
  {
    name: "username",
    label: "Username",
    description: "GitHub username",
    category: "Profile",
    icon: User,
    example: "johndoe",
    emoji: "👤",
  },
]

// GitHub Emojis for widgets
const GITHUB_EMOJIS = [
  { emoji: "💻", label: "Computer", category: "Development" },
  { emoji: "🚀", label: "Rocket", category: "Development" },
  { emoji: "⭐", label: "Star", category: "GitHub" },
  { emoji: "🔀", label: "Merge", category: "GitHub" },
  { emoji: "🐛", label: "Bug", category: "GitHub" },
  { emoji: "✨", label: "Sparkles", category: "GitHub" },
  { emoji: "🔥", label: "Fire", category: "Popular" },
  { emoji: "💡", label: "Idea", category: "Development" },
  { emoji: "📚", label: "Books", category: "Learning" },
  { emoji: "🎯", label: "Target", category: "Goals" },
  { emoji: "📈", label: "Chart", category: "Stats" },
  { emoji: "🏆", label: "Trophy", category: "Achievement" },
  { emoji: "💎", label: "Diamond", category: "Quality" },
  { emoji: "🌟", label: "Glowing Star", category: "Special" },
  { emoji: "🎨", label: "Art", category: "Design" },
  { emoji: "⚡", label: "Lightning", category: "Fast" },
  { emoji: "🔧", label: "Wrench", category: "Tools" },
  { emoji: "📊", label: "Bar Chart", category: "Analytics" },
  { emoji: "🎉", label: "Party", category: "Celebration" },
  { emoji: "💪", label: "Strong", category: "Power" },
]

// Canvas preset sizes
const CANVAS_PRESETS = [
  { name: "Small Badge", width: 300, height: 120 },
  { name: "Medium Card", width: 400, height: 200 },
  { name: "Large Banner", width: 500, height: 150 },
  { name: "Square Card", width: 300, height: 300 },
  { name: "Wide Display", width: 600, height: 200 },
  { name: "Custom", width: 400, height: 200 },
]

// Element types for the toolbar
const ELEMENT_TYPES = [
  { type: "text", label: "Text", icon: Type },
  { type: "variable", label: "GitHub Variable", icon: GitCommit },
  { type: "emoji", label: "Emoji", icon: Smile },
  { type: "rectangle", label: "Rectangle", icon: Square },
  { type: "circle", label: "Circle", icon: Circle },
  { type: "star", label: "Star", icon: Star },
]

// Font options
const FONT_FAMILIES = ["Inter", "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Monaco", "Courier New"]

// Widget Element Interface
interface WidgetElement {
  id: string
  type: "text" | "variable" | "emoji" | "rectangle" | "circle" | "star"
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  style: {
    backgroundColor: string
    color: string
    fontSize: number
    fontWeight: string
    fontFamily: string
    fontStyle: string
    textDecoration: string
    borderRadius: number
    borderWidth: number
    borderColor: string
    opacity: number
    textAlign: "left" | "center" | "right"
    padding: number
    shadow: boolean
    shadowColor: string
    shadowBlur: number
    shadowOffsetX: number
    shadowOffsetY: number
  }
  content: {
    text?: string
    variable?: string
    emoji?: string
  }
  visible: boolean
  locked: boolean
  zIndex: number
}

// Widget Interface
interface Widget {
  _id?: string
  name: string
  elements: WidgetElement[]
  canvas: {
    width: number
    height: number
    backgroundColor: string
    backgroundImage?: string
    showGrid: boolean
    gridSize: number
    snapToGrid: boolean
  }
  is_private: boolean
  tags: string[]
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

// API Functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = getCookie("devboard_access_token")
  if (!accessToken) {
    throw new Error("Please log in to continue")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = "An error occurred"
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.error || errorJson.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    throw new Error(errorMessage)
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  }
  return response.text()
}

// Draggable Element Component
function DraggableElement({ element }: { element: any }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "ELEMENT",
    item: { elementType: element.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const Icon = element.icon

  return (
    <div
      ref={dragRef}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all duration-200 ${
        isDragging
          ? "opacity-50 border-blue-400 bg-blue-500/10"
          : "border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-gray-700/50"
      }`}
    >
      <div className="p-2 rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm text-gray-200 font-medium">{element.label}</span>
    </div>
  )
}

// Canvas Component
function Canvas({
  widget,
  selectedElements,
  onElementAdd,
  onElementSelect,
  onElementUpdate,
  zoom,
}: {
  widget: Widget
  selectedElements: WidgetElement[]
  onElementAdd: (element: WidgetElement) => void
  onElementSelect: (elements: WidgetElement[]) => void
  onElementUpdate: (element: WidgetElement) => void
  zoom: number
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedElement, setDraggedElement] = useState<WidgetElement | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "ELEMENT",
    drop: (item: { elementType: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        let x = Math.max(0, (offset.x - canvasRect.left) / zoom)
        let y = Math.max(0, (offset.y - canvasRect.top) / zoom)

        if (widget.canvas.snapToGrid) {
          x = Math.round(x / widget.canvas.gridSize) * widget.canvas.gridSize
          y = Math.round(y / widget.canvas.gridSize) * widget.canvas.gridSize
        }

        const newElement = createNewElement(item.elementType, x, y)
        onElementAdd(newElement)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const createNewElement = (type: string, x: number, y: number): WidgetElement => {
    const baseElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: { x, y },
      rotation: 0,
      visible: true,
      locked: false,
      zIndex: widget.elements.length + 1,
      style: {
        backgroundColor: "#3B82F6",
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
        fontFamily: "Inter",
        fontStyle: "normal",
        textDecoration: "none",
        borderRadius: 8,
        borderWidth: 0,
        borderColor: "#E5E7EB",
        opacity: 1,
        textAlign: "center" as const,
        padding: 12,
        shadow: true,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowBlur: 8,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
      },
      content: {},
    }

    switch (type) {
      case "text":
        return {
          ...baseElement,
          type: "text" as const,
          size: { width: 140, height: 40 },
          content: { text: "Sample Text" },
          style: {
            ...baseElement.style,
            backgroundColor: "#3B82F6",
          },
        }
      case "variable":
        return {
          ...baseElement,
          type: "variable" as const,
          size: { width: 160, height: 40 },
          content: { variable: "totalCommitContributions", text: "{{totalCommitContributions}}" },
          style: {
            ...baseElement.style,
            backgroundColor: "#10B981",
          },
        }
      case "emoji":
        return {
          ...baseElement,
          type: "emoji" as const,
          size: { width: 60, height: 60 },
          content: { emoji: "💻" },
          style: {
            ...baseElement.style,
            backgroundColor: "transparent",
            fontSize: 32,
            shadow: false,
          },
        }
      case "rectangle":
        return {
          ...baseElement,
          type: "rectangle" as const,
          size: { width: 120, height: 80 },
          style: {
            ...baseElement.style,
            backgroundColor: "#8B5CF6",
          },
        }
      case "circle":
        return {
          ...baseElement,
          type: "circle" as const,
          size: { width: 80, height: 80 },
          style: {
            ...baseElement.style,
            backgroundColor: "#F59E0B",
            borderRadius: 50,
          },
        }
      case "star":
        return {
          ...baseElement,
          type: "star" as const,
          size: { width: 80, height: 80 },
          style: {
            ...baseElement.style,
            backgroundColor: "#EF4444",
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
        x: (e.clientX - rect.left) / zoom - element.position.x,
        y: (e.clientY - rect.top) / zoom - element.position.y,
      })
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedElement || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      let newX = Math.max(0, (e.clientX - rect.left) / zoom - dragOffset.x)
      let newY = Math.max(0, (e.clientY - rect.top) / zoom - dragOffset.y)

      // Constrain to canvas bounds
      newX = Math.min(newX, widget.canvas.width - draggedElement.size.width)
      newY = Math.min(newY, widget.canvas.height - draggedElement.size.height)

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
      widget.canvas.width,
      widget.canvas.height,
    ],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null)
  }, [])

  useEffect(() => {
    if (draggedElement) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [draggedElement, handleMouseMove, handleMouseUp])

  const renderGrid = () => {
    if (!widget.canvas.showGrid) return null
    const gridLines = []
    const gridSize = widget.canvas.gridSize * zoom
    const canvasWidth = widget.canvas.width * zoom
    const canvasHeight = widget.canvas.height * zoom

    for (let x = 0; x <= canvasWidth; x += gridSize) {
      gridLines.push(
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={canvasHeight} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />,
      )
    }

    for (let y = 0; y <= canvasHeight; y += gridSize) {
      gridLines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={canvasWidth} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />,
      )
    }

    return (
      <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>
        {gridLines}
      </svg>
    )
  }

  const renderElement = (element: WidgetElement) => {
    if (!element.visible) return null

    const isSelected = selectedElements.some((el) => el.id === element.id)
    const transform = `rotate(${element.rotation}deg)`
    const shadowStyle = element.style.shadow
      ? `${element.style.shadowOffsetX}px ${element.style.shadowOffsetY}px ${element.style.shadowBlur}px ${element.style.shadowColor}`
      : "none"

    const elementProps = {
      key: element.id,
      className: `absolute cursor-pointer transition-all duration-200 select-none ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" : "hover:ring-1 hover:ring-blue-300/50"
      } ${element.locked ? "cursor-not-allowed opacity-60" : ""}`,
      style: {
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform,
        opacity: element.style.opacity,
        zIndex: element.zIndex,
        boxShadow: shadowStyle,
      },
      onMouseDown: (e: React.MouseEvent) => handleElementMouseDown(element, e),
    }

    switch (element.type) {
      case "text":
      case "variable":
        return (
          <div {...elementProps}>
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                fontSize: element.style.fontSize,
                fontWeight: element.style.fontWeight,
                fontFamily: element.style.fontFamily,
                fontStyle: element.style.fontStyle,
                textDecoration: element.style.textDecoration,
                color: element.style.color,
                textAlign: element.style.textAlign,
                backgroundColor: element.style.backgroundColor,
                borderRadius: element.style.borderRadius,
                border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
                padding: element.style.padding,
              }}
            >
              {element.content.text || "Text"}
            </div>
          </div>
        )

      case "emoji":
        return (
          <div {...elementProps}>
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                fontSize: element.style.fontSize,
                backgroundColor: element.style.backgroundColor,
                borderRadius: element.style.borderRadius,
                border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
              }}
            >
              {element.content.emoji || "💻"}
            </div>
          </div>
        )

      case "rectangle":
        return (
          <div {...elementProps}>
            <div
              className="w-full h-full"
              style={{
                backgroundColor: element.style.backgroundColor,
                borderRadius: element.style.borderRadius,
                border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
              }}
            />
          </div>
        )

      case "circle":
        return (
          <div {...elementProps}>
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: element.style.backgroundColor,
                border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
              }}
            />
          </div>
        )

      case "star":
        return (
          <div {...elementProps}>
            <div className="w-full h-full flex items-center justify-center">
              <Star
                className="w-full h-full"
                style={{ color: element.style.backgroundColor }}
                fill={element.style.backgroundColor}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-950">
      <div className="w-full h-full flex items-center justify-center p-8">
        <div
          ref={dropRef}
          className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 ${
            isOver ? "border-blue-400 bg-blue-500/5" : "border-gray-600"
          }`}
          style={{
            width: widget.canvas.width * zoom,
            height: widget.canvas.height * zoom,
            backgroundColor: widget.canvas.backgroundColor,
          }}
        >
          <div ref={canvasRef} className="relative w-full h-full">
            {renderGrid()}
            {widget.elements.sort((a, b) => a.zIndex - b.zIndex).map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate backend content
const generateBackendContent = (widget: Widget): string => {
  let content = ""

  widget.elements
    .filter((element) => element.visible)
    .sort((a, b) => a.zIndex - b.zIndex)
    .forEach((element) => {
      const transform =
        element.rotation !== 0
          ? ` transform="rotate(${element.rotation} ${element.position.x + element.size.width / 2} ${element.position.y + element.size.height / 2})"`
          : ""
      const opacity = element.style.opacity !== 1 ? ` opacity="${element.style.opacity}"` : ""

      switch (element.type) {
        case "text":
        case "variable":
          const textContent = element.content.text || ""
          const isGitHubVariable = GITHUB_VARIABLES.some((variable) => textContent === `{{${variable.name}}}`)

          if (isGitHubVariable) {
            content += `<text>${textContent}</text>`
          } else {
            content += `<text x="${element.position.x + element.size.width / 2}" y="${element.position.y + element.size.height / 2 + element.style.fontSize / 3}" fill="${element.style.color}" fontSize="${element.style.fontSize}" fontWeight="${element.style.fontWeight}" textAnchor="middle"${opacity}${transform}>${textContent}</text>`
          }
          break

        case "emoji":
          content += `<text x="${element.position.x + element.size.width / 2}" y="${element.position.y + element.size.height / 2 + element.style.fontSize / 3}" fontSize="${element.style.fontSize}" textAnchor="middle"${opacity}${transform}>${element.content.emoji}</text>`
          break

        case "rectangle":
          content += `<rect x="${element.position.x}" y="${element.position.y}" width="${element.size.width}" height="${element.size.height}" fill="${element.style.backgroundColor}" rx="${element.style.borderRadius}"${opacity}${transform}/>`
          break

        case "circle":
          const radius = Math.min(element.size.width, element.size.height) / 2
          content += `<circle cx="${element.position.x + element.size.width / 2}" cy="${element.position.y + element.size.height / 2}" r="${radius}" fill="${element.style.backgroundColor}"${opacity}${transform}/>`
          break
      }
    })

  return content
}

// Main Component
function GitHubWidgetBuilderContent() {
  const [showInitialModal, setShowInitialModal] = useState(true)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedCanvasSize, setSelectedCanvasSize] = useState(CANVAS_PRESETS[1])
  const [customWidth, setCustomWidth] = useState(400)
  const [customHeight, setCustomHeight] = useState(200)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedElements, setSelectedElements] = useState<WidgetElement[]>([])
  const [zoom, setZoom] = useState(1)

  // Widget states
  const [userWidgets, setUserWidgets] = useState<Widget[]>([])
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)

  const [widget, setWidget] = useState<Widget>({
    name: "My GitHub Widget",
    elements: [],
    canvas: {
      width: 400,
      height: 200,
      backgroundColor: "#0D1117",
      showGrid: true,
      gridSize: 10,
      snapToGrid: false,
    },
    is_private: false,
    tags: [],
  })

  // Load user widgets
  const loadUserWidgets = async () => {
    try {
      setIsLoading(true)
      const widgets = await apiCall("/api/widget/all")
      setUserWidgets(Array.isArray(widgets) ? widgets : [])
    } catch (error: any) {
      if (error.message.includes("No widgets found")) {
        setUserWidgets([])
      } else {
        toast.error(`Failed to load widgets: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserWidgets()
  }, [])

  // Handle canvas size selection
  const handleCanvasSizeSelect = (size: (typeof CANVAS_PRESETS)[0]) => {
    setSelectedCanvasSize(size)
    if (size.name === "Custom") {
      setWidget((prev) => ({
        ...prev,
        canvas: { ...prev.canvas, width: customWidth, height: customHeight },
      }))
    } else {
      setWidget((prev) => ({
        ...prev,
        canvas: { ...prev.canvas, width: size.width, height: size.height },
      }))
    }
    setShowInitialModal(false)
  }

  // Add element to canvas
  const addElement = (element: WidgetElement) => {
    setWidget((prev) => ({
      ...prev,
      elements: [...prev.elements, element],
    }))
    setSelectedElements([element])
    toast.success(`Added ${element.type} element`)
  }

  // Update element
  const updateElement = (updatedElement: WidgetElement) => {
    setWidget((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el)),
    }))
    setSelectedElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
  }

  // Delete element
  const deleteElement = (elementId: string) => {
    setWidget((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }))
    setSelectedElements((prev) => prev.filter((el) => el.id !== elementId))
    toast.success("Element deleted")
  }

  // Save widget
  const handleSave = async () => {
    if (!widget.name.trim()) {
      toast.error("Please provide a name for your widget")
      return
    }

    if (widget.elements.length === 0) {
      toast.error("Please add at least one element to your widget")
      return
    }

    setIsSaving(true)
    try {
      const saveData = {
        name: widget.name,
        content: generateBackendContent(widget),
        size: { width: widget.canvas.width, height: widget.canvas.height },
        isPrivate: widget.is_private,
        Tags: widget.tags,
      }

      if (editingWidget) {
        await apiCall("/api/widget/", {
          method: "PATCH",
          body: JSON.stringify(saveData),
        })
        toast.success("Widget updated successfully!")
      } else {
        await apiCall("/api/widget/", {
          method: "POST",
          body: JSON.stringify(saveData),
        })
        toast.success("Widget created successfully!")
      }

      setShowSaveModal(false)
      setEditingWidget(null)
      loadUserWidgets()
    } catch (error: any) {
      toast.error(`Failed to save widget: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Add/remove tags
  const addTag = (tag: string) => {
    if (tag && !widget.tags.includes(tag)) {
      setWidget((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setWidget((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const selectedElement = selectedElements[0]

  // Group variables by category
  const variablesByCategory = GITHUB_VARIABLES.reduce(
    (acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = []
      }
      acc[variable.category].push(variable)
      return acc
    },
    {} as Record<string, typeof GITHUB_VARIABLES>,
  )

  // Group emojis by category
  const emojisByCategory = GITHUB_EMOJIS.reduce(
    (acc, emoji) => {
      if (!acc[emoji.category]) {
        acc[emoji.category] = []
      }
      acc[emoji.category].push(emoji)
      return acc
    },
    {} as Record<string, typeof GITHUB_EMOJIS>,
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-gray-950 text-white pt-20">
        {/* Initial Canvas Size Modal */}
        <Dialog open={showInitialModal} onOpenChange={setShowInitialModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Choose Canvas Size</DialogTitle>
              <DialogDescription className="text-gray-400">
                Select the dimensions for your GitHub widget
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {CANVAS_PRESETS.map((size) => (
                <Card
                  key={size.name}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedCanvasSize.name === size.name
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500 bg-gray-800"
                  }`}
                  onClick={() => setSelectedCanvasSize(size)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className="mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded border"
                      style={{
                        width: Math.min(size.width / 4, 80),
                        height: Math.min(size.height / 4, 50),
                      }}
                    />
                    <h3 className="font-semibold text-white mb-1">{size.name}</h3>
                    <p className="text-sm text-blue-400">
                      {size.width} × {size.height}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedCanvasSize.name === "Custom" && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Custom Dimensions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Width (px)</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                      min="100"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Height (px)</Label>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                      min="50"
                      max="600"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={() => handleCanvasSizeSelect(selectedCanvasSize)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Widget
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Modal */}
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingWidget ? "Edit Widget" : "Save Widget"}</DialogTitle>
              <DialogDescription className="text-gray-400">Configure your widget settings</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white">Widget Name</Label>
                <Input
                  value={widget.name}
                  onChange={(e) => setWidget((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="Enter widget name"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <Label className="text-white">Private Widget</Label>
                  <p className="text-sm text-gray-400">Only you can see this widget</p>
                </div>
                <Switch
                  checked={widget.is_private}
                  onCheckedChange={(checked) => setWidget((prev) => ({ ...prev, is_private: checked }))}
                />
              </div>

              <div>
                <Label className="text-white">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {widget.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-600 text-white cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addTag}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Add a tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="stats">Stats</SelectItem>
                    <SelectItem value="contributions">Contributions</SelectItem>
                    <SelectItem value="repositories">Repositories</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {editingWidget ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingWidget ? "Update Widget" : "Save Widget"}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">GitHub Widget Builder</h1>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigator.clipboard.writeText(generateBackendContent(widget))}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            <Button onClick={() => setShowSaveModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Widget
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-140px)] overflow-hidden">
          {/* Left Sidebar - Elements & Variables */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
            <Tabs defaultValue="elements" className="flex-1 flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 m-2 flex-shrink-0">
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="emojis">Emojis</TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Drag Elements</h3>
                      <div className="space-y-2">
                        {ELEMENT_TYPES.map((element) => (
                          <DraggableElement key={element.type} element={element} />
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="text-lg font-semibold mb-3">Canvas Controls</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={widget.canvas.showGrid ? "default" : "outline"}
                            onClick={() =>
                              setWidget((prev) => ({
                                ...prev,
                                canvas: { ...prev.canvas, showGrid: !prev.canvas.showGrid },
                              }))
                            }
                            className="flex-1"
                          >
                            <Grid3X3 className="w-4 h-4 mr-2" />
                            Grid
                          </Button>
                          <Button
                            size="sm"
                            variant={widget.canvas.snapToGrid ? "default" : "outline"}
                            onClick={() =>
                              setWidget((prev) => ({
                                ...prev,
                                canvas: { ...prev.canvas, snapToGrid: !prev.canvas.snapToGrid },
                              }))
                            }
                            className="flex-1"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Snap
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                            className="border-gray-600"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <div className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                            className="border-gray-600"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setZoom(1)} className="border-gray-600">
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="variables" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold">GitHub Variables</h3>
                    {Object.entries(variablesByCategory).map(([category, variables]) => (
                      <Collapsible key={category} defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                          <span className="font-medium">{category}</span>
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {variables.map((variable) => {
                            const Icon = variable.icon
                            return (
                              <div
                                key={variable.name}
                                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer"
                                onClick={() => {
                                  const newElement = {
                                    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    type: "variable" as const,
                                    position: { x: 50, y: 50 },
                                    size: { width: 160, height: 40 },
                                    rotation: 0,
                                    visible: true,
                                    locked: false,
                                    zIndex: widget.elements.length + 1,
                                    style: {
                                      backgroundColor: "#10B981",
                                      color: "#FFFFFF",
                                      fontSize: 16,
                                      fontWeight: "500",
                                      fontFamily: "Inter",
                                      fontStyle: "normal",
                                      textDecoration: "none",
                                      borderRadius: 8,
                                      borderWidth: 0,
                                      borderColor: "#E5E7EB",
                                      opacity: 1,
                                      textAlign: "center" as const,
                                      padding: 12,
                                      shadow: true,
                                      shadowColor: "rgba(0, 0, 0, 0.1)",
                                      shadowBlur: 8,
                                      shadowOffsetX: 0,
                                      shadowOffsetY: 2,
                                    },
                                    content: {
                                      variable: variable.name,
                                      text: `${variable.emoji} {{${variable.name}}}`,
                                    },
                                  }
                                  addElement(newElement)
                                }}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{variable.emoji}</span>
                                    <Icon className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <span className="font-medium text-white">{variable.label}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-1">{variable.description}</p>
                                <p className="text-xs text-green-400 font-mono">Example: {variable.example}</p>
                              </div>
                            )
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="emojis" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold">GitHub Emojis</h3>
                    {Object.entries(emojisByCategory).map(([category, emojis]) => (
                      <Collapsible key={category} defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                          <span className="font-medium">{category}</span>
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="grid grid-cols-4 gap-2">
                            {emojis.map((emoji) => (
                              <div
                                key={emoji.emoji}
                                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer text-center transition-all duration-200 hover:scale-105"
                                onClick={() => {
                                  const newElement = {
                                    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    type: "emoji" as const,
                                    position: { x: 50, y: 50 },
                                    size: { width: 60, height: 60 },
                                    rotation: 0,
                                    visible: true,
                                    locked: false,
                                    zIndex: widget.elements.length + 1,
                                    style: {
                                      backgroundColor: "transparent",
                                      color: "#FFFFFF",
                                      fontSize: 32,
                                      fontWeight: "normal",
                                      fontFamily: "Inter",
                                      fontStyle: "normal",
                                      textDecoration: "none",
                                      borderRadius: 8,
                                      borderWidth: 0,
                                      borderColor: "#E5E7EB",
                                      opacity: 1,
                                      textAlign: "center" as const,
                                      padding: 0,
                                      shadow: false,
                                      shadowColor: "rgba(0, 0, 0, 0.1)",
                                      shadowBlur: 8,
                                      shadowOffsetX: 0,
                                      shadowOffsetY: 2,
                                    },
                                    content: {
                                      emoji: emoji.emoji,
                                    },
                                  }
                                  addElement(newElement)
                                }}
                                title={emoji.label}
                              >
                                <div className="text-2xl mb-1">{emoji.emoji}</div>
                                <div className="text-xs text-gray-400 truncate">{emoji.label}</div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1">
            <Canvas
              widget={widget}
              selectedElements={selectedElements}
              onElementAdd={addElement}
              onElementSelect={setSelectedElements}
              onElementUpdate={updateElement}
              zoom={zoom}
            />
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-bold">Properties</h2>
              <p className="text-sm text-gray-400">
                {selectedElements.length > 0 ? "Edit selected element" : "Select an element to edit"}
              </p>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {selectedElement ? (
                  <div className="p-4 space-y-6">
                    {/* Element Info */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateElement({ ...selectedElement, visible: !selectedElement.visible })}
                        >
                          {selectedElement.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateElement({ ...selectedElement, locked: !selectedElement.locked })}
                        >
                          {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteElement(selectedElement.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Position & Size */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Position & Size</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-400">X</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedElement.position.x)}
                            onChange={(e) =>
                              updateElement({
                                ...selectedElement,
                                position: { ...selectedElement.position, x: Number(e.target.value) || 0 },
                              })
                            }
                            className="bg-gray-800 border-gray-600 text-white h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Y</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedElement.position.y)}
                            onChange={(e) =>
                              updateElement({
                                ...selectedElement,
                                position: { ...selectedElement.position, y: Number(e.target.value) || 0 },
                              })
                            }
                            className="bg-gray-800 border-gray-600 text-white h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Width</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedElement.size.width)}
                            onChange={(e) =>
                              updateElement({
                                ...selectedElement,
                                size: { ...selectedElement.size, width: Number(e.target.value) || 0 },
                              })
                            }
                            className="bg-gray-800 border-gray-600 text-white h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Height</Label>
                          <Input
                            type="number"
                            value={Math.round(selectedElement.size.height)}
                            onChange={(e) =>
                              updateElement({
                                ...selectedElement,
                                size: { ...selectedElement.size, height: Number(e.target.value) || 0 },
                              })
                            }
                            className="bg-gray-800 border-gray-600 text-white h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    {selectedElement.type === "text" && (
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Content</Label>
                        <Input
                          value={selectedElement.content.text || ""}
                          onChange={(e) =>
                            updateElement({
                              ...selectedElement,
                              content: { ...selectedElement.content, text: e.target.value },
                            })
                          }
                          placeholder="Enter text"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    )}

                    {selectedElement.type === "variable" && (
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Content</Label>
                        <Select
                          value={selectedElement.content.variable || "totalCommitContributions"}
                          onValueChange={(value) => {
                            const variable = GITHUB_VARIABLES.find((v) => v.name === value)
                            updateElement({
                              ...selectedElement,
                              content: {
                                variable: value,
                                text: `${variable?.emoji || ""} {{${value}}}`,
                              },
                            })
                          }}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {GITHUB_VARIABLES.map((variable) => (
                              <SelectItem key={variable.name} value={variable.name}>
                                {variable.emoji} {variable.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedElement.type === "emoji" && (
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Emoji</Label>
                        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                          {GITHUB_EMOJIS.map((emoji) => (
                            <button
                              key={emoji.emoji}
                              className={`p-2 rounded border text-xl hover:bg-gray-700 transition-colors ${
                                selectedElement.content.emoji === emoji.emoji
                                  ? "border-blue-500 bg-blue-500/20"
                                  : "border-gray-600"
                              }`}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  content: { ...selectedElement.content, emoji: emoji.emoji },
                                })
                              }
                              title={emoji.label}
                            >
                              {emoji.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Typography */}
                    {(selectedElement.type === "text" || selectedElement.type === "variable") && (
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Typography</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-400">Font Family</Label>
                            <Select
                              value={selectedElement.style.fontFamily}
                              onValueChange={(value) =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, fontFamily: value },
                                })
                              }
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                {FONT_FAMILIES.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-400 mb-2 block">Font Size</Label>
                            <Slider
                              value={[selectedElement.style.fontSize]}
                              onValueChange={([value]) =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, fontSize: value },
                                })
                              }
                              min={8}
                              max={72}
                              step={1}
                              className="[&_[role=slider]]:bg-blue-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>8px</span>
                              <span>{selectedElement.style.fontSize}px</span>
                              <span>72px</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={selectedElement.style.fontWeight === "bold" ? "default" : "outline"}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  style: {
                                    ...selectedElement.style,
                                    fontWeight: selectedElement.style.fontWeight === "bold" ? "normal" : "bold",
                                  },
                                })
                              }
                              className="flex-1"
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedElement.style.fontStyle === "italic" ? "default" : "outline"}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  style: {
                                    ...selectedElement.style,
                                    fontStyle: selectedElement.style.fontStyle === "italic" ? "normal" : "italic",
                                  },
                                })
                              }
                              className="flex-1"
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedElement.style.textDecoration === "underline" ? "default" : "outline"}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  style: {
                                    ...selectedElement.style,
                                    textDecoration:
                                      selectedElement.style.textDecoration === "underline" ? "none" : "underline",
                                  },
                                })
                              }
                              className="flex-1"
                            >
                              <Underline className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={selectedElement.style.textAlign === "left" ? "default" : "outline"}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, textAlign: "left" },
                                })
                              }
                              className="flex-1"
                            >
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedElement.style.textAlign === "center" ? "default" : "outline"}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, textAlign: "center" },
                                })
                              }
                              className="flex-1"
                            >
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedElement.style.textAlign === "right" ? "default" : "outline"}
                              onClick={() =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, textAlign: "right" },
                                })
                              }
                              className="flex-1"
                            >
                              <AlignRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emoji Size */}
                    {selectedElement.type === "emoji" && (
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Size</Label>
                        <div>
                          <Label className="text-xs text-gray-400 mb-2 block">Emoji Size</Label>
                          <Slider
                            value={[selectedElement.style.fontSize]}
                            onValueChange={([value]) =>
                              updateElement({
                                ...selectedElement,
                                style: { ...selectedElement.style, fontSize: value },
                              })
                            }
                            min={16}
                            max={128}
                            step={4}
                            className="[&_[role=slider]]:bg-blue-500"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>16px</span>
                            <span>{selectedElement.style.fontSize}px</span>
                            <span>128px</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Colors */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Colors</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-400">Background Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={selectedElement.style.backgroundColor}
                              onChange={(e) =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, backgroundColor: e.target.value },
                                })
                              }
                              className="w-12 h-8 p-1 bg-gray-800 border-gray-600"
                            />
                            <Input
                              value={selectedElement.style.backgroundColor}
                              onChange={(e) =>
                                updateElement({
                                  ...selectedElement,
                                  style: { ...selectedElement.style, backgroundColor: e.target.value },
                                })
                              }
                              className="bg-gray-800 border-gray-600 text-white text-xs h-8"
                            />
                          </div>
                        </div>

                        {(selectedElement.type === "text" || selectedElement.type === "variable") && (
                          <div>
                            <Label className="text-xs text-gray-400">Text Color</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={selectedElement.style.color}
                                onChange={(e) =>
                                  updateElement({
                                    ...selectedElement,
                                    style: { ...selectedElement.style, color: e.target.value },
                                  })
                                }
                                className="w-12 h-8 p-1 bg-gray-800 border-gray-600"
                              />
                              <Input
                                value={selectedElement.style.color}
                                onChange={(e) =>
                                  updateElement({
                                    ...selectedElement,
                                    style: { ...selectedElement.style, color: e.target.value },
                                  })
                                }
                                className="bg-gray-800 border-gray-600 text-white text-xs h-8"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Border & Effects */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Border & Effects</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-400 mb-2 block">Border Radius</Label>
                          <Slider
                            value={[selectedElement.style.borderRadius]}
                            onValueChange={([value]) =>
                              updateElement({
                                ...selectedElement,
                                style: { ...selectedElement.style, borderRadius: value },
                              })
                            }
                            min={0}
                            max={50}
                            step={1}
                            className="[&_[role=slider]]:bg-blue-500"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0px</span>
                            <span>{selectedElement.style.borderRadius}px</span>
                            <span>50px</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-400 mb-2 block">Opacity</Label>
                          <Slider
                            value={[selectedElement.style.opacity]}
                            onValueChange={([value]) =>
                              updateElement({
                                ...selectedElement,
                                style: { ...selectedElement.style, opacity: value },
                              })
                            }
                            min={0}
                            max={1}
                            step={0.1}
                            className="[&_[role=slider]]:bg-blue-500"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span>
                            <span>{Math.round(selectedElement.style.opacity * 100)}%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-400">Drop Shadow</Label>
                          <Switch
                            checked={selectedElement.style.shadow}
                            onCheckedChange={(checked) =>
                              updateElement({
                                ...selectedElement,
                                style: { ...selectedElement.style, shadow: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Settings className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Element Selected</h3>
                    <p className="text-sm text-gray-500">Click on an element in the canvas to edit its properties</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Layers Panel */}
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Layers</h3>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {widget.elements.length}
                </Badge>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="space-y-1">
                  {widget.elements
                    .sort((a, b) => b.zIndex - a.zIndex)
                    .map((element) => (
                      <div
                        key={element.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedElements.some((el) => el.id === element.id)
                            ? "bg-blue-600/20 border border-blue-500/30"
                            : "hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedElements([element])}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                          <span className="text-sm text-white font-medium">
                            {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateElement({ ...element, visible: !element.visible })
                            }}
                            className="text-gray-400 hover:text-white p-1 h-6 w-6"
                          >
                            {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateElement({ ...element, locked: !element.locked })
                            }}
                            className="text-gray-400 hover:text-white p-1 h-6 w-6"
                          >
                            {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DndProvider>
  )
}

export default function GitHubWidgetBuilder() {
  return (
    <ProtectedRoute>
      <GitHubWidgetBuilderContent />
    </ProtectedRoute>
  )
}
