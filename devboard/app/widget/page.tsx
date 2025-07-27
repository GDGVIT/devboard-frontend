"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Save, Copy, ArrowLeft, Settings, RefreshCw, Sparkles, BarChart3, GitCommit, GitPullRequest, AlertCircle, Star, BookOpen, User, Edit, Trash2, Plus, Search, X } from 'lucide-react'
import { toast } from "sonner"

// Supported GitHub Variables
const GITHUB_VARIABLES = [
  {
    name: "totalCommitContributions",
    label: "Total Commits",
    icon: GitCommit,
    color: "from-green-500 to-green-600",
    description: "Total number of commits made",
  },
  {
    name: "totalIssueContributions",
    label: "Total Issues",
    icon: AlertCircle,
    color: "from-orange-500 to-orange-600",
    description: "Total issues created or contributed to",
  },
  {
    name: "totalPullRequestContributions",
    label: "Total PRs",
    icon: GitPullRequest,
    color: "from-purple-500 to-purple-600",
    description: "Total pull requests created",
  },
  {
    name: "totalRepositoriesWithContributedCommits",
    label: "Contributed Repos",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    description: "Repositories with contributions",
  },
  {
    name: "totalStars",
    label: "Total Stars",
    icon: Star,
    color: "from-yellow-500 to-yellow-600",
    description: "Total stars received across all repos",
  },
  {
    name: "totalRepositories",
    label: "Total Repositories",
    icon: BookOpen,
    color: "from-indigo-500 to-indigo-600",
    description: "Total number of repositories",
  },
  {
    name: "username",
    label: "Username",
    icon: User,
    color: "from-gray-500 to-gray-600",
    description: "GitHub username",
  },
]

// Canvas Sizes
const CANVAS_SIZES = [
  { name: "Small Badge", width: 200, height: 60, description: "Compact metric display", icon: "🏷️" },
  { name: "Medium Card", width: 300, height: 120, description: "Standard GitHub badge", icon: "📊" },
  { name: "Large Banner", width: 400, height: 150, description: "Wide profile banner", icon: "🎯" },
  { name: "Square Card", width: 250, height: 250, description: "Square format", icon: "⬜" },
  { name: "Custom", width: 300, height: 120, description: "Set your own dimensions", icon: "✨" },
]

// Widget Interface
interface Widget {
  _id?: string
  name: string
  content: string
  size: {
    width: number
    height: number
  }
  is_private: boolean
  tags: string[]
  created_by?: string
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

// Widget Preview Component
function WidgetPreview({ widget }: { widget: Widget }) {
  const extractVariable = (content: string) => {
    const match = content.match(/\{\{(\w+)\}\}/)
    return match ? match[1] : null
  }

  const variable = extractVariable(widget.content)
  const selectedVar = GITHUB_VARIABLES.find((v) => v.name === variable)
  const Icon = selectedVar?.icon || BarChart3

  // Extract display text (everything except the variable)
  const displayText = widget.content.replace(/<text>|<\/text>/g, "").replace(/\{\{\w+\}\}/, "1,234")

  return (
    <div
      className="bg-gradient-to-br from-[#0D1117] to-[#161B22] border border-white/10 rounded-xl p-6 shadow-2xl flex items-center justify-between"
      style={{ width: widget.size.width, height: widget.size.height }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-white/70 text-sm font-medium mb-1">{selectedVar?.label || "GitHub Metric"}</div>
        <div className="text-xl font-bold text-white truncate">{displayText}</div>
      </div>
      <div
        className={`p-3 rounded-lg bg-gradient-to-br ${selectedVar?.color || "from-blue-500 to-blue-600"} shadow-lg`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  )
}

// Widget Card Component
function WidgetCard({
  widget,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  widget: Widget
  onEdit: (widget: Widget) => void
  onDelete: (name: string) => void
  onDuplicate: (widget: Widget) => void
}) {
  return (
    <Card className="border-white/10 bg-black/10 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg truncate">{widget.name}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(widget)} className="text-white/70 hover:text-white">
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(widget)}
              className="text-white/70 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(widget.name)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {widget.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
              {tag}
            </Badge>
          ))}
          {widget.is_private && (
            <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 text-xs">
              Private
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-center">
          <WidgetPreview widget={widget} />
        </div>
        <div className="text-xs text-white/50 font-mono bg-black/20 p-3 rounded border border-white/10">
          {widget.content}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Component
export default function GitHubWidgetBuilder() {
  const [showInitialModal, setShowInitialModal] = useState(true)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedCanvasSize, setSelectedCanvasSize] = useState(CANVAS_SIZES[1])
  const [customWidth, setCustomWidth] = useState(300)
  const [customHeight, setCustomHeight] = useState(120)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [searchTerm, setSearchTerm] = useState("")
  const [customContent, setCustomContent] = useState("<text>{{totalCommitContributions}}</text>")

  // Widget states
  const [userWidgets, setUserWidgets] = useState<Widget[]>([])
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)

  const [widget, setWidget] = useState<Widget>({
    name: "My GitHub Widget",
    content: "<text>{{totalCommitContributions}}</text>",
    size: { width: 300, height: 120 },
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

  // Load data on component mount
  useEffect(() => {
    loadUserWidgets()
  }, [])

  // Update widget content when custom content changes
  useEffect(() => {
    setWidget((prev) => ({
      ...prev,
      content: customContent,
    }))
  }, [customContent])

  // Handle canvas size selection
  const handleCanvasSizeSelect = (size: (typeof CANVAS_SIZES)[0]) => {
    setSelectedCanvasSize(size)
    if (size.name !== "Custom") {
      setWidget((prev) => ({
        ...prev,
        size: { width: size.width, height: size.height },
      }))
    }
    setShowInitialModal(false)
  }

  const handleCustomSizeApply = () => {
    setWidget((prev) => ({
      ...prev,
      size: { width: customWidth, height: customHeight },
    }))
    setShowInitialModal(false)
  }

  // Save widget
  const handleSave = async () => {
    if (!widget.name.trim()) {
      toast.error("❌ Please provide a name for your widget")
      return
    }

    if (!widget.content.trim()) {
      toast.error("❌ Please provide content for your widget")
      return
    }

    setIsSaving(true)
    try {
      const saveData = {
        name: widget.name,
        content: widget.content,
        size: widget.size,
        isPrivate: widget.is_private,
        Tags: widget.tags,
      }

      console.log("Saving widget:", saveData)

      if (editingWidget) {
        // Update existing widget
        await apiCall("/api/widget/", {
          method: "PATCH",
          body: JSON.stringify(saveData),
        })
        toast.success("🎉 Widget updated successfully!")
      } else {
        // Create new widget
        await apiCall("/api/widget/", {
          method: "POST",
          body: JSON.stringify(saveData),
        })
        toast.success("🎉 Widget created successfully!")
      }

      setShowSaveModal(false)
      setEditingWidget(null)
      loadUserWidgets() // Refresh the list
      
      // Reset form for new widget
      if (!editingWidget) {
        setWidget({
          name: "My GitHub Widget",
          content: "<text>{{totalCommitContributions}}</text>",
          size: { width: 300, height: 120 },
          is_private: false,
          tags: [],
        })
        setCustomContent("<text>{{totalCommitContributions}}</text>")
      }
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(`❌ Failed to save widget: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Edit widget
  const handleEdit = (widgetToEdit: Widget) => {
    setEditingWidget(widgetToEdit)
    setWidget(widgetToEdit)
    setCustomContent(widgetToEdit.content)
    setActiveTab("create")
  }

  // Delete widget
  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await apiCall(`/api/widget/?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      })
      toast.success("🗑️ Widget deleted successfully")
      loadUserWidgets()
    } catch (error: any) {
      toast.error(`❌ Failed to delete widget: ${error.message}`)
    }
  }

  // Duplicate widget
  const handleDuplicate = (widgetToDuplicate: Widget) => {
    const duplicatedWidget = {
      ...widgetToDuplicate,
      name: `${widgetToDuplicate.name} (Copy)`,
      _id: undefined,
    }
    setWidget(duplicatedWidget)
    setCustomContent(widgetToDuplicate.content)
    setEditingWidget(null)
    setActiveTab("create")
  }

  // Copy widget code
  const copyWidgetCode = () => {
    navigator.clipboard.writeText(widget.content)
    toast.success("📋 Widget code copied to clipboard!")
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

  // Insert variable into content
  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`
    setCustomContent((prev) => {
      // If content is empty or just default, replace it
      if (!prev.trim() || prev === "<text>{{totalCommitContributions}}</text>") {
        return `<text>${variable}</text>`
      }
      // Otherwise, insert at cursor position or append
      return prev.replace("</text>", ` ${variable}</text>`)
    })
  }

  // Reset form
  const resetForm = () => {
    setWidget({
      name: "My GitHub Widget",
      content: "<text>{{totalCommitContributions}}</text>",
      size: { width: 300, height: 120 },
      is_private: false,
      tags: [],
    })
    setCustomContent("<text>{{totalCommitContributions}}</text>")
    setEditingWidget(null)
  }

  // Filter widgets
  const filteredUserWidgets = userWidgets.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F0C14] via-[#1A1625] to-[#0F0C14] text-white">
      {/* Initial Canvas Size Modal */}
      <Dialog open={showInitialModal} onOpenChange={setShowInitialModal}>
        <DialogContent className="bg-black/20 backdrop-blur-2xl border border-white/10 text-white max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              ✨ Create Your GitHub Widget
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-lg">
              Choose the perfect size for your GitHub metric widget
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">{size.icon}</div>
                    <div
                      className="mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl border-2 border-blue-400/30 shadow-2xl"
                      style={{
                        width: Math.min(size.width / 3, 120),
                        height: Math.min(size.height / 3, 80),
                      }}
                    />
                    <h3 className="font-bold text-white text-lg mb-2">{size.name}</h3>
                    <p className="text-sm text-blue-400 font-semibold mb-2">
                      {size.width} × {size.height}
                    </p>
                    <p className="text-xs text-gray-400">{size.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCanvasSize.name === "Custom" && (
            <div className="mt-8 p-6 bg-black/10 rounded-2xl border border-white/10">
              <h4 className="text-xl font-bold mb-6 text-blue-400">✨ Custom Dimensions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-base font-semibold">Width (px)</Label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="bg-black/20 border-white/20 text-white mt-2 h-12 text-base rounded-xl"
                    min="100"
                    max="800"
                  />
                </div>
                <div>
                  <Label className="text-white text-base font-semibold">Height (px)</Label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="bg-black/20 border-white/20 text-white mt-2 h-12 text-base rounded-xl"
                    min="50"
                    max="400"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <Button
              variant="outline"
              className="bg-black/20 border-white/20 hover:bg-black/40 text-white px-6 py-3 text-base rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={
                selectedCanvasSize.name === "Custom"
                  ? handleCustomSizeApply
                  : () => handleCanvasSizeSelect(selectedCanvasSize)
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-base rounded-xl shadow-2xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Widget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="bg-black/20 backdrop-blur-2xl border border-white/10 text-white max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-400">
              {editingWidget ? "✏️ Edit Widget" : "💾 Save Widget"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-lg">
              Configure your widget settings before saving
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-8">
            <div>
              <Label className="text-white font-semibold text-lg">Widget Name</Label>
              <Input
                value={widget.name}
                onChange={(e) => setWidget((prev) => ({ ...prev, name: e.target.value }))}
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
                checked={widget.is_private}
                onCheckedChange={(checked) => setWidget((prev) => ({ ...prev, is_private: checked }))}
                className="data-[state=checked]:bg-blue-600 scale-125"
              />
            </div>

            <div>
              <Label className="text-white font-semibold text-lg">🏷️ Tags</Label>
              <div className="flex flex-wrap gap-3 mt-4 mb-4">
                {widget.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors px-4 py-2 text-sm rounded-full"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addTag}>
                <SelectTrigger className="bg-black/20 border-white/20 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Add a tag" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1625] border-white/20 rounded-xl">
                  <SelectItem value="stats">📊 Stats</SelectItem>
                  <SelectItem value="contributions">📈 Contributions</SelectItem>
                  <SelectItem value="repositories">📚 Repositories</SelectItem>
                  <SelectItem value="profile">👤 Profile</SelectItem>
                  <SelectItem value="activity">⚡ Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveModal(false)
                setEditingWidget(null)
              }}
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

      {/* Main Interface */}
      <div className="min-h-screen pt-16">
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-black/20 backdrop-blur-2xl border-b border-white/10">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ✨ GitHub Widget Builder
            </h1>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={copyWidgetCode}
              variant="outline"
              className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
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

        {/* Main Content */}
        <div className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 rounded-xl p-1 mb-8 max-w-md">
              <TabsTrigger value="create" className="text-white data-[state=active]:bg-blue-600 rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Widget
              </TabsTrigger>
              <TabsTrigger value="my-widgets" className="text-white data-[state=active]:bg-blue-600 rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                My Widgets ({userWidgets.length})
              </TabsTrigger>
            </TabsList>

            {/* Create Widget Tab */}
            <TabsContent value="create">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Side - Widget Builder */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">🎨 Widget Builder</h2>
                      <p className="text-white/60">Create your custom GitHub widget</p>
                    </div>

                    {/* Widget Settings */}
                    <Card className="bg-black/10 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Widget Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label className="text-white font-semibold">Widget Name</Label>
                          <Input
                            value={widget.name}
                            onChange={(e) => setWidget((prev) => ({ ...prev, name: e.target.value }))}
                            className="bg-black/20 border-white/20 text-white mt-2 h-12 rounded-xl"
                            placeholder="Enter widget name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white font-semibold">Width (px)</Label>
                            <Input
                              type="number"
                              value={widget.size.width}
                              onChange={(e) =>
                                setWidget((prev) => ({
                                  ...prev,
                                  size: { ...prev.size, width: Number(e.target.value) || 0 },
                                }))
                              }
                              className="bg-black/20 border-white/20 text-white mt-2 h-12 rounded-xl"
                              min="100"
                              max="800"
                            />
                          </div>
                          <div>
                            <Label className="text-white font-semibold">Height (px)</Label>
                            <Input
                              type="number"
                              value={widget.size.height}
                              onChange={(e) =>
                                setWidget((prev) => ({
                                  ...prev,
                                  size: { ...prev.size, height: Number(e.target.value) || 0 },
                                }))
                              }
                              className="bg-black/20 border-white/20 text-white mt-2 h-12 rounded-xl"
                              min="50"
                              max="400"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
                          <div>
                            <Label className="text-white font-semibold">Private Widget</Label>
                            <p className="text-sm text-gray-400 mt-1">Only you can see this widget</p>
                          </div>
                          <Switch
                            checked={widget.is_private}
                            onCheckedChange={(checked) => setWidget((prev) => ({ ...prev, is_private: checked }))}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Widget Content Editor */}
                    <Card className="bg-black/10 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Widget Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label className="text-white font-semibold mb-4 block">Custom Content</Label>
                          <Textarea
                            value={customContent}
                            onChange={(e) => setCustomContent(e.target.value)}
                            placeholder="<text>{{totalCommitContributions}}</text>"
                            className="bg-black/20 border-white/20 text-white rounded-xl resize-none font-mono"
                            rows={4}
                          />
                          <p className="text-xs text-white/50 mt-2">
                            {/* 💡 Use GitHub variables like {{`{totalCommitContributions}`}} in your content */}
                          </p>
                        </div>

                        <div>
                          <Label className="text-white font-semibold mb-4 block">Quick Insert Variables</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {GITHUB_VARIABLES.map((variable) => {
                              const Icon = variable.icon
                              return (
                                <Button
                                  key={variable.name}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable(variable.name)}
                                  className="bg-black/20 border-white/20 hover:bg-blue-600/20 hover:border-blue-400 text-white rounded-xl justify-start"
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {variable.label}
                                </Button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={resetForm}
                            variant="outline"
                            className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
                          >
                            Reset
                          </Button>
                          <Button
                            onClick={() => setShowSaveModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl flex-1"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {editingWidget ? "Update Widget" : "Save Widget"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Side - Preview & Code */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">👀 Preview</h3>
                      <p className="text-white/60">See how your widget will look</p>
                    </div>

                    {/* Widget Preview */}
                    <Card className="bg-black/10 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Widget Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center p-8">
                          <WidgetPreview widget={widget} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generated Code */}
                    <Card className="bg-black/10 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">Generated Code</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyWidgetCode}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-black/20 p-4 rounded-xl border border-white/10 overflow-x-auto">
                          <code>{widget.content}</code>
                        </pre>
                      </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-black/10 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">💡 Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm text-white/70">
                          {/* <div>• Use variables like {{`{totalCommitContributions}`}} for dynamic content</div> */}
                          <div>• Add custom text around variables for context</div>
                          <div>• Adjust widget dimensions to fit your needs</div>
                          <div>• Save your widget to use it in your GitHub profile</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* My Widgets Tab */}
            <TabsContent value="my-widgets">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Widgets</h2>
                    <p className="text-white/60">Manage your created widgets</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search widgets..."
                        className="bg-black/20 border-white/20 text-white pl-10 h-12 rounded-xl w-64"
                      />
                    </div>
                    <Button
                      onClick={loadUserWidgets}
                      variant="outline"
                      className="bg-black/20 border-white/20 hover:bg-black/40 text-white rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                  </div>
                ) : filteredUserWidgets.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Widgets Found</h3>
                    <p className="text-white/60 mb-8">
                      {searchTerm ? "No widgets match your search" : "Create your first GitHub widget"}
                    </p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Widget
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredUserWidgets.map((userWidget) => (
                      <WidgetCard
                        key={userWidget._id || userWidget.name}
                        widget={userWidget}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
