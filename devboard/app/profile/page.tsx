"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Star,
  Clock,
  ArrowLeft,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Code,
  Activity,
  GitFork,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

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

interface Widget {
  _id: string
  name: string
  content: string
  size: { width: number; height: number }
  isPrivate: boolean
  Tags: string[]
  createdAt: string
  updatedAt: string
}

function ProfileContent() {
  const { user, isAuthenticated } = useAuth()
  const [githubData, setGithubData] = useState<any>(null)
  const [userWidgets, setUserWidgets] = useState<Widget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchGitHubProfile = async () => {
      if (!user?.username) return
      try {
        const response = await fetch(`https://api.github.com/users/${user.username}`)
        if (response.ok) {
          const data = await response.json()
          setGithubData(data)
        }
      } catch (error) {
        console.error("Failed to fetch GitHub profile:", error)
        toast.error("Failed to load GitHub profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGitHubProfile()
  }, [user])

  useEffect(() => {
    const fetchUserWidgets = async () => {
      try {
        setIsLoadingWidgets(true)
        const widgets = await apiCall("/api/widget/all")
        setUserWidgets(Array.isArray(widgets) ? widgets : [])
      } catch (error: any) {
        if (!error.message.includes("No widgets found")) {
          toast.error(`Failed to load widgets: ${error.message}`)
        }
        setUserWidgets([])
      } finally {
        setIsLoadingWidgets(false)
      }
    }

    if (user) {
      fetchUserWidgets()
    }
  }, [user])

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm("Are you sure you want to delete this widget?")) return

    try {
      await apiCall(`/api/widget/${widgetId}`, {
        method: "DELETE",
      })
      setUserWidgets((prev) => prev.filter((widget) => widget._id !== widgetId))
      toast.success("Widget deleted successfully")
    } catch (error: any) {
      toast.error(`Failed to delete widget: ${error.message}`)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  return (
    <main className="min-h-screen bg-gray-950 pt-20 pb-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-gray-900 border-gray-700 hover:bg-gray-800 text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700 sticky top-24">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-700 flex items-center justify-center ring-2 ring-gray-600">
                    {githubData?.avatar_url || user.avatar_url ? (
                      <img
                        src={githubData?.avatar_url || user.avatar_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {/* Basic Info */}
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {githubData?.name || user.name || user.username}
                  </h2>
                  <p className="text-gray-400 mb-2">@{user.username}</p>
                  {githubData?.bio && <p className="text-gray-300 text-sm mb-4 leading-relaxed">{githubData.bio}</p>}

                  {/* GitHub Stats */}
                  {githubData && (
                    <div className="grid grid-cols-3 gap-4 w-full mb-4">
                      <div className="text-center">
                        <div className="text-white font-semibold text-lg">{formatNumber(githubData.followers)}</div>
                        <div className="text-gray-400 text-xs">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold text-lg">{formatNumber(githubData.following)}</div>
                        <div className="text-gray-400 text-xs">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold text-lg">{formatNumber(githubData.public_repos)}</div>
                        <div className="text-gray-400 text-xs">Repos</div>
                      </div>
                    </div>
                  )}

                  {/* GitHub Profile Link */}
                  {githubData?.html_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(githubData.html_url, "_blank")}
                      className="bg-gray-800 border-gray-600 hover:bg-gray-700 text-white w-full cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      View on GitHub
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Details */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-green-400" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Username</p>
                    <p className="text-white font-medium">{user.username}</p>
                  </div>
                  {githubData?.created_at && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">GitHub Member Since</p>
                      <p className="text-white font-medium">{formatDate(githubData.created_at)}</p>
                    </div>
                  )}
                  {user.email && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                  )}
                  {githubData?.location && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Location</p>
                      <p className="text-white font-medium">{githubData.location}</p>
                    </div>
                  )}
                  {githubData?.company && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Company</p>
                      <p className="text-white font-medium">{githubData.company}</p>
                    </div>
                  )}
                  {githubData?.blog && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Website</p>
                      <a
                        href={githubData.blog.startsWith("http") ? githubData.blog : `https://${githubData.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
                      >
                        {githubData.blog}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GitHub Activity */}
            {githubData && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-purple-400" />
                    GitHub Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {formatNumber(githubData.public_repos)}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                        <Code className="w-3 h-3" />
                        Public Repos
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">{formatNumber(githubData.followers)}</div>
                      <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                        <User className="w-3 h-3" />
                        Followers
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {formatNumber(githubData.following)}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                        <GitFork className="w-3 h-3" />
                        Following
                      </div>
                    </div>
                    {githubData.public_gists !== undefined && (
                      <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {formatNumber(githubData.public_gists)}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" />
                          Public Gists
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Widgets */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Code className="mr-2 h-5 w-5 text-yellow-400" />
                    My Widgets
                    <Badge variant="secondary" className="ml-2 bg-gray-800 text-gray-300 border border-gray-600">
                      {userWidgets.length}
                    </Badge>
                  </CardTitle>
                  <Button
                    onClick={() => router.push("/widget")}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Widget
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingWidgets ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userWidgets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Code className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Widgets Yet</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Create your first GitHub widget to showcase your stats and contributions in a beautiful,
                      customizable format.
                    </p>
                    <Button
                      onClick={() => router.push("/widget")}
                      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Widget
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {userWidgets.map((widget) => (
                        <Card
                          key={widget._id}
                          className="bg-gray-800 border-gray-600 hover:border-gray-500 transition-all duration-200 hover:shadow-lg"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white mb-1 truncate">{widget.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                  <span className="bg-gray-700 px-2 py-1 rounded">
                                    {widget.size.width} × {widget.size.height}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {widget.isPrivate ? (
                                      <>
                                        <EyeOff className="w-3 h-3" />
                                        <span>Private</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3 h-3" />
                                        <span>Public</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>Created {formatDate(widget.createdAt)}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteWidget(widget._id)}
                                className="text-gray-400 hover:text-red-400 p-1 h-8 w-8 ml-2 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {widget.Tags && widget.Tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {widget.Tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {widget.Tags.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-700 text-gray-400 border border-gray-600 text-xs"
                                  >
                                    +{widget.Tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="bg-gray-950 rounded-lg p-3 border border-gray-700">
                              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <Code className="w-3 h-3" />
                                Widget Preview
                              </div>
                              <div
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded border border-gray-600/50 flex items-center justify-center text-xs text-gray-400 font-mono"
                                style={{
                                  width: "100%",
                                  height: Math.min(80, (80 * widget.size.height) / widget.size.width),
                                  maxHeight: 80,
                                }}
                              >
                                <div className="text-center">
                                  <div className="text-lg mb-1">📊</div>
                                  <div>
                                    {widget.size.width} × {widget.size.height}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
