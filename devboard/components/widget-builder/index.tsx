"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Palette,
  Type,
  ImageIcon,
  BarChart3,
  Star,
  Share2,
  Download,
  Sparkles,
  Layers,
  Settings,
  Eye,
  Code,
  Save,
  Undo,
  Redo,
  Zap,
  ArrowRight,
} from "lucide-react"
import { Poppins } from "next/font/google"
import type { Widget, WidgetElement, WidgetTemplate } from "@/types/widget"

// Initialize the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

// Widget Templates
const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: "github-stats",
    name: "GitHub Stats Card",
    description: "Display GitHub statistics with custom styling",
    category: "Developer",
    preview: "/placeholder.svg?height=120&width=300&text=GitHub+Stats",
    popularity: 95,
    elements: [
      {
        type: "container",
        position: { x: 0, y: 0 },
        size: { width: 300, height: 120 },
        style: {
          backgroundColor: "#0E0C1A",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
        },
        content: {},
      },
      {
        type: "text",
        position: { x: 16, y: 16 },
        size: { width: 268, height: 24 },
        style: {
          color: "#DEC9F0",
          fontSize: 18,
          fontWeight: "bold",
        },
        content: { text: "{{username}}'s GitHub Stats" },
      },
    ],
  },
  {
    id: "skill-badge",
    name: "Skill Badge",
    description: "Animated skill proficiency badge",
    category: "Skills",
    preview: "/placeholder.svg?height=60&width=200&text=Skill+Badge",
    popularity: 87,
    elements: [
      {
        type: "badge",
        position: { x: 0, y: 0 },
        size: { width: 200, height: 60 },
        style: {
          backgroundColor: "#3F1469",
          borderRadius: 30,
          color: "#DEC9F0",
        },
        content: { badgeType: "shield", text: "{{skill}} - {{level}}%" },
      },
    ],
  },
]

// Draggable Element Types
const ELEMENT_TYPES = [
  { type: "text", icon: Type, label: "Text", color: "bg-[#3F1469]" },
  { type: "image", icon: ImageIcon, label: "Image", color: "bg-[#4a1a7d]" },
  { type: "chart", icon: BarChart3, label: "Chart", color: "bg-[#5d2291]" },
  { type: "badge", icon: Star, label: "Badge", color: "bg-[#6f2ba5]" },
  { type: "progress", icon: Zap, label: "Progress", color: "bg-[#8133b9]" },
  { type: "container", icon: Layers, label: "Container", color: "bg-[#933ccd]" },
]

// Draggable Element Component
function DraggableElement({ type, icon: Icon, label, color }: any) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "element",
    item: { elementType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={dragRef as any}
      className={`
        flex items-center gap-2 p-3 rounded-lg border border-[#3F1469]/30 
        cursor-move hover:border-[#D3A8FF]/50 transition-all duration-300
        bg-[#0E0C1A]/50 hover:bg-[#0E0C1A]/80
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
      style={{
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className={`p-2 rounded ${color}`}>
        <Icon className="w-4 h-4 text-[#DEC9F0]" />
      </div>
      <span className="text-sm font-medium text-[#DEC9F0]">{label}</span>
    </div>
  )
}

// Canvas Component
function Canvas({
  widget,
  onElementAdd,
  onElementSelect,
  selectedElement,
  onElementUpdate,
}: {
  widget: Widget
  onElementAdd: (element: WidgetElement) => void
  onElementSelect: (element: WidgetElement | null) => void
  selectedElement: WidgetElement | null
  onElementUpdate: (element: WidgetElement) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "element",
    drop: (item: { elementType: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const x = offset.x - canvasRect.left
        const y = offset.y - canvasRect.top

        const newElement: WidgetElement = {
          id: `element-${Date.now()}`,
          type: item.elementType as any,
          position: { x, y },
          size: { width: 100, height: 40 },
          style: {
            backgroundColor: "#0E0C1A",
            color: "#DEC9F0",
            fontSize: 14,
            borderRadius: 4,
            padding: 8,
          },
          content: {
            text: item.elementType === "text" ? "Sample Text" : undefined,
          },
        }

        onElementAdd(newElement)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={dropRef as any}
      className={`
        relative border-2 border-dashed rounded-lg overflow-hidden transition-all duration-300
        ${isOver ? "border-[#D3A8FF] bg-[#3F1469]/10" : "border-[#3F1469]/30"}
      `}
      style={{
        width: widget.canvas.width,
        height: widget.canvas.height,
        backgroundColor: widget.canvas.backgroundColor,
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.2)",
      }}
    >
      <div ref={canvasRef} className="relative w-full h-full">
        {widget.elements.map((element) => (
          <div
            key={element.id}
            className={`
              absolute cursor-pointer border-2 transition-all duration-300
              ${
                selectedElement?.id === element.id
                  ? "border-[#D3A8FF] shadow-[0_0_20px_rgba(211,168,255,0.5)]"
                  : "border-transparent hover:border-[#3F1469]/50"
              }
            `}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.style,
            }}
            onClick={() => onElementSelect(element)}
          >
            {element.type === "text" && (
              <div className="w-full h-full flex items-center justify-center text-[#DEC9F0]">
                {element.content.text}
              </div>
            )}
            {element.type === "container" && (
              <div className="w-full h-full border border-[#3F1469]/30 rounded bg-[#0E0C1A]/50" />
            )}
            {element.type === "badge" && (
              <div className="w-full h-full flex items-center justify-center rounded-full">
                <Badge className="bg-[#3F1469] text-[#DEC9F0] border-[#D3A8FF]/30">
                  {element.content.text || "Badge"}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Property Panel Component
function PropertyPanel({
  selectedElement,
  onElementUpdate,
}: {
  selectedElement: WidgetElement | null
  onElementUpdate: (element: WidgetElement) => void
}) {
  if (!selectedElement) {
    return <div className="p-4 text-center text-[#DEC9F0]/70">Select an element to edit its properties</div>
  }

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
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#DEC9F0]">Element Properties</h3>

          {/* Position & Size */}
          <Card className="mb-4 bg-[#0E0C1A]/50 border-[#3F1469]/30">
            <CardHeader>
              <CardTitle className="text-sm text-[#DEC9F0]">Position & Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-[#DEC9F0]/70">X</Label>
                  <Input
                    type="number"
                    value={selectedElement.position.x}
                    onChange={(e) =>
                      updateElement({
                        position: { ...selectedElement.position, x: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#DEC9F0]/70">Y</Label>
                  <Input
                    type="number"
                    value={selectedElement.position.y}
                    onChange={(e) =>
                      updateElement({
                        position: { ...selectedElement.position, y: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-[#DEC9F0]/70">Width</Label>
                  <Input
                    type="number"
                    value={selectedElement.size.width}
                    onChange={(e) =>
                      updateElement({
                        size: { ...selectedElement.size, width: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#DEC9F0]/70">Height</Label>
                  <Input
                    type="number"
                    value={selectedElement.size.height}
                    onChange={(e) =>
                      updateElement({
                        size: { ...selectedElement.size, height: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {selectedElement.type === "text" && (
            <Card className="mb-4 bg-[#0E0C1A]/50 border-[#3F1469]/30">
              <CardHeader>
                <CardTitle className="text-sm text-[#DEC9F0]">Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="text-xs text-[#DEC9F0]/70">Text</Label>
                <Input
                  value={selectedElement.content.text || ""}
                  onChange={(e) => updateContent({ text: e.target.value })}
                  placeholder="Enter text..."
                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                />
              </CardContent>
            </Card>
          )}

          {/* Styling */}
          <Card className="mb-4 bg-[#0E0C1A]/50 border-[#3F1469]/30">
            <CardHeader>
              <CardTitle className="text-sm text-[#DEC9F0]">Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-[#DEC9F0]/70">Background Color</Label>
                <Input
                  type="color"
                  value={selectedElement.style.backgroundColor || "#0E0C1A"}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="bg-[#0E0C1A] border-[#3F1469]/30"
                />
              </div>
              <div>
                <Label className="text-xs text-[#DEC9F0]/70">Text Color</Label>
                <Input
                  type="color"
                  value={selectedElement.style.color || "#DEC9F0"}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                  className="bg-[#0E0C1A] border-[#3F1469]/30"
                />
              </div>
              <div>
                <Label className="text-xs text-[#DEC9F0]/70">Font Size</Label>
                <Slider
                  value={[selectedElement.style.fontSize || 14]}
                  onValueChange={([value]) => updateStyle({ fontSize: value })}
                  min={8}
                  max={48}
                  step={1}
                  className="[&_[role=slider]]:bg-[#3F1469] [&_[role=slider]]:border-[#D3A8FF]"
                />
                <span className="text-xs text-[#DEC9F0]/50">{selectedElement.style.fontSize || 14}px</span>
              </div>
              <div>
                <Label className="text-xs text-[#DEC9F0]/70">Border Radius</Label>
                <Slider
                  value={[selectedElement.style.borderRadius || 0]}
                  onValueChange={([value]) => updateStyle({ borderRadius: value })}
                  min={0}
                  max={50}
                  step={1}
                  className="[&_[role=slider]]:bg-[#3F1469] [&_[role=slider]]:border-[#D3A8FF]"
                />
                <span className="text-xs text-[#DEC9F0]/50">{selectedElement.style.borderRadius || 0}px</span>
              </div>
              <div>
                <Label className="text-xs text-[#DEC9F0]/70">Padding</Label>
                <Slider
                  value={[selectedElement.style.padding || 0]}
                  onValueChange={([value]) => updateStyle({ padding: value })}
                  min={0}
                  max={50}
                  step={1}
                  className="[&_[role=slider]]:bg-[#3F1469] [&_[role=slider]]:border-[#D3A8FF]"
                />
                <span className="text-xs text-[#DEC9F0]/50">{selectedElement.style.padding || 0}px</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}

// Code Generator
function generateWidgetCode(widget: Widget): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"

  return `<!-- ${widget.name} Widget -->
<div id="${widget.id}" style="width: ${widget.canvas.width}px; height: ${widget.canvas.height}px;">
  <img src="${baseUrl}/api/widget/${widget.id}?username={{username}}" 
       alt="${widget.name}" 
       style="width: 100%; height: 100%; object-fit: cover;" />
</div>

<!-- Markdown Usage -->
![${widget.name}](${baseUrl}/api/widget/${widget.id}?username=YOUR_USERNAME)

<!-- HTML Embed -->
<iframe src="${baseUrl}/widget/${widget.id}?username=YOUR_USERNAME" 
        width="${widget.canvas.width}" 
        height="${widget.canvas.height}" 
        frameborder="0">
</iframe>

<!-- React Component -->
<WidgetEmbed 
  widgetId="${widget.id}" 
  username="YOUR_USERNAME" 
  width={${widget.canvas.width}} 
  height={${widget.canvas.height}} 
/>`
}

// Main Widget Builder Component
export default function WidgetBuilder() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [currentWidget, setCurrentWidget] = useState<Widget | null>(null)
  const [selectedElement, setSelectedElement] = useState<WidgetElement | null>(null)
  const [activeTab, setActiveTab] = useState("design")

  // Load widgets from localStorage on mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem("widgets")
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets))
    }
  }, [])

  // Save widgets to localStorage
  const saveWidgets = useCallback((updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets)
    localStorage.setItem("widgets", JSON.stringify(updatedWidgets))
  }, [])

  // Create new widget
  const createNewWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      name: "New Widget",
      description: "A custom widget",
      category: "Custom",
      elements: [],
      canvas: {
        width: 400,
        height: 200,
        backgroundColor: "#0E0C1A",
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0.0",
        tags: [],
        author: "Anonymous",
        downloads: 0,
        rating: 0,
      },
      settings: {
        isPublic: false,
        allowCustomization: true,
        requiresAuth: false,
      },
    }

    const updatedWidgets = [...widgets, newWidget]
    saveWidgets(updatedWidgets)
    setCurrentWidget(newWidget)
  }

  // Add element to current widget
  const addElement = (element: WidgetElement) => {
    if (!currentWidget) return

    const updatedWidget = {
      ...currentWidget,
      elements: [...currentWidget.elements, element],
      metadata: {
        ...currentWidget.metadata,
        updatedAt: new Date().toISOString(),
      },
    }

    setCurrentWidget(updatedWidget)
    const updatedWidgets = widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    saveWidgets(updatedWidgets)
  }

  // Update element
  const updateElement = (updatedElement: WidgetElement) => {
    if (!currentWidget) return

    const updatedWidget = {
      ...currentWidget,
      elements: currentWidget.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el)),
      metadata: {
        ...currentWidget.metadata,
        updatedAt: new Date().toISOString(),
      },
    }

    setCurrentWidget(updatedWidget)
    setSelectedElement(updatedElement)
    const updatedWidgets = widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    saveWidgets(updatedWidgets)
  }

  // Apply template
  const applyTemplate = (template: WidgetTemplate) => {
    if (!currentWidget) return

    const elementsWithIds = template.elements.map((el) => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}`,
    }))

    const updatedWidget = {
      ...currentWidget,
      elements: elementsWithIds,
      name: template.name,
      description: template.description,
      category: template.category,
    }

    setCurrentWidget(updatedWidget)
    const updatedWidgets = widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    saveWidgets(updatedWidgets)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`h-screen flex bg-[#0F0C14] ${poppins.variable} font-sans`}>
        {/* Left Sidebar - Elements & Templates */}
        <div className="w-80 bg-[#0E0C1A]/80 border-r border-[#3F1469]/30 flex flex-col backdrop-blur-sm">
          <div className="p-4 border-b border-[#3F1469]/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#DEC9F0]">Widget Builder</h2>
              <button
                onClick={createNewWidget}
                className="relative bg-[#0E0C1A] text-[#DEC9F0] rounded-full px-4 py-2 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                style={{
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">New Widget</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </button>
            </div>

            <Tabs defaultValue="elements" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0E0C1A]/50 border border-[#3F1469]/30">
                <TabsTrigger
                  value="elements"
                  className="text-[#DEC9F0] data-[state=active]:bg-[#3F1469] data-[state=active]:text-[#DEC9F0]"
                >
                  Elements
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="text-[#DEC9F0] data-[state=active]:bg-[#3F1469] data-[state=active]:text-[#DEC9F0]"
                >
                  Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="mt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#DEC9F0]/70 mb-3">Drag & Drop Elements</h3>
                  {ELEMENT_TYPES.map((elementType) => (
                    <DraggableElement key={elementType.type} {...elementType} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="templates" className="mt-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#DEC9F0]/70 mb-3">Widget Templates</h3>
                  {WIDGET_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-[0_0_20px_rgba(211,168,255,0.3)] transition-all duration-300 bg-[#0E0C1A]/50 border-[#3F1469]/30"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={template.preview || "/placeholder.svg"}
                            alt={template.name}
                            className="w-12 h-12 rounded object-cover border border-[#3F1469]/30"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-[#DEC9F0]">{template.name}</h4>
                            <p className="text-xs text-[#DEC9F0]/70">{template.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-[#3F1469] text-[#DEC9F0] border-[#D3A8FF]/30"
                              >
                                {template.category}
                              </Badge>
                              <span className="text-xs text-[#DEC9F0]/50">{template.popularity}% popular</span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="w-full mt-2 relative bg-[#0E0C1A] text-[#DEC9F0] rounded-full px-4 py-2 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                          style={{
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.2)",
                          }}
                          onClick={() => applyTemplate(template)}
                          disabled={!currentWidget}
                        >
                          <span className="text-sm">Apply Template</span>
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                            style={{
                              background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 2s infinite",
                            }}
                          />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Widget List */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-semibold text-[#DEC9F0]/70 mb-3">Your Widgets</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {widgets.map((widget) => (
                  <Card
                    key={widget.id}
                    className={`cursor-pointer transition-all duration-300 bg-[#0E0C1A]/50 border-[#3F1469]/30 ${
                      currentWidget?.id === widget.id
                        ? "ring-2 ring-[#D3A8FF] shadow-[0_0_20px_rgba(211,168,255,0.5)]"
                        : "hover:shadow-[0_0_20px_rgba(211,168,255,0.3)]"
                    }`}
                    onClick={() => setCurrentWidget(widget)}
                  >
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium text-[#DEC9F0]">{widget.name}</h4>
                      <p className="text-xs text-[#DEC9F0]/70 mt-1">{widget.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs bg-[#3F1469]/50 text-[#DEC9F0] border-[#D3A8FF]/30">
                          {widget.category}
                        </Badge>
                        <span className="text-xs text-[#DEC9F0]/50">{widget.elements.length} elements</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-[#0E0C1A]/80 border-b border-[#3F1469]/30 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {currentWidget && (
                  <>
                    <Input
                      value={currentWidget.name}
                      onChange={(e) => {
                        const updatedWidget = { ...currentWidget, name: e.target.value }
                        setCurrentWidget(updatedWidget)
                        const updatedWidgets = widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
                        saveWidgets(updatedWidgets)
                      }}
                      className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-transparent text-[#DEC9F0]"
                    />
                    <Badge variant="secondary" className="bg-[#3F1469] text-[#DEC9F0] border-[#D3A8FF]/30">
                      {currentWidget.category}
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0] hover:bg-[#3F1469]/20"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0] hover:bg-[#3F1469]/20"
                >
                  <Redo className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 bg-[#3F1469]/30" />
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0] hover:bg-[#3F1469]/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0] hover:bg-[#3F1469]/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <button
                  className="relative bg-[#0E0C1A] text-[#DEC9F0] rounded-full px-4 py-2 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  style={{
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex-1 flex">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start border-b border-[#3F1469]/30 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="design"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D3A8FF] text-[#DEC9F0] data-[state=active]:text-[#D3A8FF]"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Design
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D3A8FF] text-[#DEC9F0] data-[state=active]:text-[#D3A8FF]"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D3A8FF] text-[#DEC9F0] data-[state=active]:text-[#D3A8FF]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D3A8FF] text-[#DEC9F0] data-[state=active]:text-[#D3A8FF]"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 flex">
                <TabsContent value="design" className="flex-1 p-6 m-0">
                  {currentWidget ? (
                    <div className="flex justify-center items-center h-full">
                      <Canvas
                        widget={currentWidget}
                        onElementAdd={addElement}
                        onElementSelect={setSelectedElement}
                        selectedElement={selectedElement}
                        onElementUpdate={updateElement}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#DEC9F0]/70">
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#3F1469]" />
                        <h3 className="text-lg font-medium mb-2 text-[#DEC9F0]">No Widget Selected</h3>
                        <p className="text-sm text-[#DEC9F0]/70">
                          Create a new widget or select an existing one to start designing
                        </p>
                        <button
                          onClick={createNewWidget}
                          className="mt-4 relative bg-[#0E0C1A] text-[#DEC9F0] rounded-full px-6 py-3 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mx-auto"
                          style={{
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
                          }}
                        >
                          <span className="text-lg">Create Your First Widget</span>
                          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                            style={{
                              background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 2s infinite",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="code" className="flex-1 p-6 m-0">
                  {currentWidget ? (
                    <div className="h-full">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 text-[#DEC9F0]">Generated Code</h3>
                        <p className="text-sm text-[#DEC9F0]/70">
                          Copy and paste this code to embed your widget anywhere
                        </p>
                      </div>
                      <Card className="h-full bg-[#0E0C1A]/50 border-[#3F1469]/30">
                        <CardContent className="p-4 h-full">
                          <pre className="text-sm bg-[#0F0C14] p-4 rounded overflow-auto h-full text-[#DEC9F0] border border-[#3F1469]/30">
                            <code>{generateWidgetCode(currentWidget)}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#DEC9F0]/70">
                      Select a widget to view its generated code
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="flex-1 p-6 m-0">
                  {currentWidget ? (
                    <div className="h-full">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 text-[#DEC9F0]">Live Preview</h3>
                        <p className="text-sm text-[#DEC9F0]/70">See how your widget will look when embedded</p>
                      </div>
                      <div className="flex justify-center items-center h-full bg-[#0F0C14] rounded-lg border border-[#3F1469]/30">
                        <div
                          className="bg-[#0E0C1A] rounded-lg shadow-[0_0_20px_rgba(211,168,255,0.3)] border border-[#3F1469]/30"
                          style={{
                            width: currentWidget.canvas.width,
                            height: currentWidget.canvas.height,
                            backgroundColor: currentWidget.canvas.backgroundColor,
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-[#DEC9F0]/50">
                            Widget Preview
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#DEC9F0]/70">
                      Select a widget to preview it
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="flex-1 p-6 m-0">
                  {currentWidget ? (
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-semibold mb-6 text-[#DEC9F0]">Widget Settings</h3>

                      <div className="space-y-6">
                        <Card className="bg-[#0E0C1A]/50 border-[#3F1469]/30">
                          <CardHeader>
                            <CardTitle className="text-base text-[#DEC9F0]">Basic Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-[#DEC9F0]/70">Widget Name</Label>
                              <Input
                                value={currentWidget.name}
                                onChange={(e) => {
                                  const updatedWidget = { ...currentWidget, name: e.target.value }
                                  setCurrentWidget(updatedWidget)
                                  const updatedWidgets = widgets.map((w) =>
                                    w.id === updatedWidget.id ? updatedWidget : w,
                                  )
                                  saveWidgets(updatedWidgets)
                                }}
                                className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                              />
                            </div>
                            <div>
                              <Label className="text-[#DEC9F0]/70">Description</Label>
                              <Input
                                value={currentWidget.description}
                                onChange={(e) => {
                                  const updatedWidget = { ...currentWidget, description: e.target.value }
                                  setCurrentWidget(updatedWidget)
                                  const updatedWidgets = widgets.map((w) =>
                                    w.id === updatedWidget.id ? updatedWidget : w,
                                  )
                                  saveWidgets(updatedWidgets)
                                }}
                                className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                              />
                            </div>
                            <div>
                              <Label className="text-[#DEC9F0]/70">Category</Label>
                              <Input
                                value={currentWidget.category}
                                onChange={(e) => {
                                  const updatedWidget = { ...currentWidget, category: e.target.value }
                                  setCurrentWidget(updatedWidget)
                                  const updatedWidgets = widgets.map((w) =>
                                    w.id === updatedWidget.id ? updatedWidget : w,
                                  )
                                  saveWidgets(updatedWidgets)
                                }}
                                className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-[#0E0C1A]/50 border-[#3F1469]/30">
                          <CardHeader>
                            <CardTitle className="text-base text-[#DEC9F0]">Canvas Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[#DEC9F0]/70">Width</Label>
                                <Input
                                  type="number"
                                  value={currentWidget.canvas.width}
                                  onChange={(e) => {
                                    const updatedWidget = {
                                      ...currentWidget,
                                      canvas: {
                                        ...currentWidget.canvas,
                                        width: Number.parseInt(e.target.value) || 400,
                                      },
                                    }
                                    setCurrentWidget(updatedWidget)
                                    const updatedWidgets = widgets.map((w) =>
                                      w.id === updatedWidget.id ? updatedWidget : w,
                                    )
                                    saveWidgets(updatedWidgets)
                                  }}
                                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                                />
                              </div>
                              <div>
                                <Label className="text-[#DEC9F0]/70">Height</Label>
                                <Input
                                  type="number"
                                  value={currentWidget.canvas.height}
                                  onChange={(e) => {
                                    const updatedWidget = {
                                      ...currentWidget,
                                      canvas: {
                                        ...currentWidget.canvas,
                                        height: Number.parseInt(e.target.value) || 200,
                                      },
                                    }
                                    setCurrentWidget(updatedWidget)
                                    const updatedWidgets = widgets.map((w) =>
                                      w.id === updatedWidget.id ? updatedWidget : w,
                                    )
                                    saveWidgets(updatedWidgets)
                                  }}
                                  className="bg-[#0E0C1A] border-[#3F1469]/30 text-[#DEC9F0]"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[#DEC9F0]/70">Background Color</Label>
                              <Input
                                type="color"
                                value={currentWidget.canvas.backgroundColor}
                                onChange={(e) => {
                                  const updatedWidget = {
                                    ...currentWidget,
                                    canvas: { ...currentWidget.canvas, backgroundColor: e.target.value },
                                  }
                                  setCurrentWidget(updatedWidget)
                                  const updatedWidgets = widgets.map((w) =>
                                    w.id === updatedWidget.id ? updatedWidget : w,
                                  )
                                  saveWidgets(updatedWidgets)
                                }}
                                className="bg-[#0E0C1A] border-[#3F1469]/30"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-[#0E0C1A]/50 border-[#3F1469]/30">
                          <CardHeader>
                            <CardTitle className="text-base text-[#DEC9F0]">Publishing Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-[#DEC9F0]/70">Make Public</Label>
                                <p className="text-sm text-[#DEC9F0]/50">
                                  Allow others to discover and use this widget
                                </p>
                              </div>
                              <Switch
                                checked={currentWidget.settings.isPublic}
                                onCheckedChange={(checked) => {
                                  const updatedWidget = {
                                    ...currentWidget,
                                    settings: { ...currentWidget.settings, isPublic: checked },
                                  }
                                  setCurrentWidget(updatedWidget)
                                  const updatedWidgets = widgets.map((w) =>
                                    w.id === updatedWidget.id ? updatedWidget : w,
                                  )
                                  saveWidgets(updatedWidgets)
                                }}
                                className="data-[state=checked]:bg-[#3F1469]"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-[#DEC9F0]/70">Allow Customization</Label>
                                <p className="text-sm text-[#DEC9F0]/50">Let users customize colors and text</p>
                              </div>
                              <Switch
                                checked={currentWidget.settings.allowCustomization}
                                onCheckedChange={(checked) => {
                                  const updatedWidget = {
                                    ...currentWidget,
                                    settings: { ...currentWidget.settings, allowCustomization: checked },
                                  }
                                  setCurrentWidget(updatedWidget)
                                  const updatedWidgets = widgets.map((w) =>
                                    w.id === updatedWidget.id ? updatedWidget : w,
                                  )
                                  saveWidgets(updatedWidgets)
                                }}
                                className="data-[state=checked]:bg-[#3F1469]"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#DEC9F0]/70">
                      Select a widget to configure its settings
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            {/* Right Sidebar - Properties Panel */}
            {activeTab === "design" && (
              <div className="w-80 bg-[#0E0C1A]/80 border-l border-[#3F1469]/30 backdrop-blur-sm">
                <div className="p-4 border-b border-[#3F1469]/30">
                  <h3 className="text-lg font-semibold text-[#DEC9F0]">Properties</h3>
                </div>
                <PropertyPanel selectedElement={selectedElement} onElementUpdate={updateElement} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </DndProvider>
  )
}
