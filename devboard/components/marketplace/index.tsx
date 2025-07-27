"use client"

import { useState, useEffect, useCallback } from "react"
import { Poppins } from "next/font/google"
import { Search, Filter, ChevronLeft, ChevronRight, Eye, User, Tag } from "lucide-react"
import { useAuth, authenticatedFetch } from "@/lib/auth-context"

// Initialize the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

// Types
interface Widget {
  _id: string
  content: string
  created_by: string
  is_private: boolean
  name: string
  size: {
    height: number
    width: number
  }
  tags: string[]
}

interface MarketplaceFilters {
  widgetType?: string
  length: number
  offset: number
  search?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://devboard.varshith.tech"

export default function Marketplace() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MarketplaceFilters>({
    widgetType: "totalPullRequestContributions", // Set default widget type
    length: 10,
    offset: 0,
  })
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWidgetType, setSelectedWidgetType] = useState("totalPullRequestContributions")

  // Available widget types (updated to match your API)
  const widgetTypes = [
    "totalCommitContributions",
    "totalIssueContributions",
    "totalPullRequestContributions",
    "totalRepositoriesWithContributedCommits",
    "totalStars",
    "totalRepositories",
    "username",
  ]

  const fetchWidgets = useCallback(
    async (currentFilters: MarketplaceFilters) => {
      if (!isAuthenticated) return

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (currentFilters.widgetType) params.append("widgetType", currentFilters.widgetType)
        params.append("length", currentFilters.length.toString())
        params.append("offset", currentFilters.offset.toString())
        if (currentFilters.search) params.append("search", currentFilters.search)

        const url = `${API_BASE_URL}/api/marketplace/?${params.toString()}`
        console.log("Fetching from URL:", url)
        console.log("Filters:", currentFilters)

        const response = await authenticatedFetch(url)

        console.log("Response status:", response.status)
        console.log("Response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          // Try to get error details from response
          let errorMessage = `Failed to fetch widgets: ${response.status}`
          try {
            const errorData = await response.json()
            console.log("Error response data:", errorData)
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (parseError) {
            // If we can't parse the error response, try to get text
            try {
              const errorText = await response.text()
              console.log("Error response text:", errorText)
              if (errorText) errorMessage += ` - ${errorText}`
            } catch (textError) {
              console.log("Could not parse error response")
            }
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("Successful response data:", data)
        setWidgets(Array.isArray(data) ? data : [])
        setTotalCount(Array.isArray(data) ? data.length : 0)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch widgets"
        setError(errorMessage)
        console.error("Error fetching widgets:", err)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated],
  )

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchWidgets(filters)
    }
  }, [isAuthenticated, authLoading, fetchWidgets, filters])

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      offset: 0, // Reset to first page
    }))
  }

  const handleWidgetTypeChange = (widgetType: string) => {
    setSelectedWidgetType(widgetType)
    setFilters((prev) => ({
      ...prev,
      widgetType: widgetType || "totalPullRequestContributions", // Use default instead of undefined
      offset: 0, // Reset to first page
    }))
  }

  const handlePrevPage = () => {
    setFilters((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.length),
    }))
  }

  const handleNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.length,
    }))
  }

  const handleWidgetClick = (widget: Widget) => {
    // Handle widget selection/preview
    console.log("Widget clicked:", widget)
    // You can implement widget preview or selection logic here
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`min-h-screen bg-[#0F0C14] ${poppins.variable} font-sans`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#DEC9F0] mb-4 tracking-tight">Widget Marketplace</h1>
         
          <p className="text-[#DEC9F0] opacity-80 max-w-2xl mx-auto">
            Discover and use community-created widgets for your developer dashboard
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DEC9F0] opacity-60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-[#1A1625] border border-[#3F1469] rounded-lg pl-10 pr-4 py-3 text-[#DEC9F0] placeholder-[#DEC9F0] placeholder-opacity-60 focus:outline-none focus:border-[#D3A8FF] focus:ring-1 focus:ring-[#D3A8FF]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#3F1469] text-white px-6 py-3 rounded-lg hover:bg-[#4a1a7d] transition-colors duration-200 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {/* Widget Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleWidgetTypeChange("totalPullRequestContributions")}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                selectedWidgetType === ""
                  ? "bg-[#3F1469] text-white"
                  : "bg-[#1A1625] text-[#DEC9F0] border border-[#3F1469] hover:border-[#D3A8FF]"
              }`}
            >
              Default
            </button>
            {widgetTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleWidgetTypeChange(type)}
                className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                  selectedWidgetType === type
                    ? "bg-[#3F1469] text-white"
                    : "bg-[#1A1625] text-[#DEC9F0] border border-[#3F1469] hover:border-[#D3A8FF]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D3A8FF]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Widgets Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {widgets.map((widget) => (
                <div
                  key={widget._id}
                  onClick={() => handleWidgetClick(widget)}
                  className="bg-[#1A1625] border border-[#3F1469] rounded-lg p-6 hover:border-[#D3A8FF] transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-[#3F1469]/20"
                >
                  {/* Widget Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-[#DEC9F0] font-semibold text-lg group-hover:text-[#D3A8FF] transition-colors">
                      {widget.name}
                    </h3>
                    {!widget.is_private && <Eye className="w-5 h-5 text-[#DEC9F0] opacity-60" />}
                  </div>

                  {/* Widget Content Preview */}
                  <div className="bg-[#0F0C14] rounded-md p-3 mb-4 border border-[#3F1469]/50">
                    <code className="text-[#D3A8FF] text-sm font-mono">
                      {widget.content.length > 100 ? `${widget.content.substring(0, 100)}...` : widget.content}
                    </code>
                  </div>

                  {/* Widget Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#DEC9F0] opacity-80 text-sm">
                      <User className="w-4 h-4" />
                      <span>{widget.created_by}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#DEC9F0] opacity-80 text-sm">
                      <span>
                        Size: {widget.size.width}×{widget.size.height}
                      </span>
                    </div>

                    {/* Tags */}
                    {widget.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-[#DEC9F0] opacity-60" />
                        {widget.tags.map((tag, index) => (
                          <span key={index} className="bg-[#3F1469]/30 text-[#D3A8FF] px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {widgets.length > 0 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={filters.offset === 0}
                  className="flex items-center gap-2 bg-[#1A1625] border border-[#3F1469] text-[#DEC9F0] px-4 py-2 rounded-lg hover:border-[#D3A8FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <span className="text-[#DEC9F0] opacity-80">
                  Showing {filters.offset + 1}-
                  {Math.min(filters.offset + filters.length, filters.offset + widgets.length)}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={widgets.length < filters.length}
                  className="flex items-center gap-2 bg-[#1A1625] border border-[#3F1469] text-[#DEC9F0] px-4 py-2 rounded-lg hover:border-[#D3A8FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {widgets.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-[#DEC9F0] opacity-60 mb-4">
                  <Filter className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No widgets found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
