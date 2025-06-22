"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ArrowLeft, Loader2, Save, FileText, Eye } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://140.245.225.60"

interface ReadmeData {
  name: string
  path: string
  sha: string
  size: number
  content: string
  encoding: string
}

// Cookie utility functions
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

export default function ReadmeEditor() {
  const [markdownContent, setMarkdownContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [readmeData, setReadmeData] = useState<ReadmeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isNewReadme, setIsNewReadme] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getCookie("devboard_access_token")

      if (!accessToken) {
        console.log("No access token found, redirecting to login")
        router.push("/login")
        return
      }

      setIsAuthChecking(false)
    }

    // Small delay to ensure auth context is loaded
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  // Decode base64 content
  const decodeBase64Content = (content: string): string => {
    try {
      return atob(content.replace(/\n/g, ""))
    } catch (error) {
      console.error("Failed to decode base64 content:", error)
      return content
    }
  }

  // Make authenticated request
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const accessToken = getCookie("devboard_access_token")

    if (!accessToken) {
      throw new Error("No access token available")
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
  }

  // Fetch README from GitHub
  const fetchReadme = useCallback(async () => {
    if (isAuthChecking) return

    setIsLoading(true)
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/github/readme`)

      if (response.status === 404) {
        // No README found
        setIsNewReadme(true)
        setMarkdownContent("")
        setOriginalContent("")
        toast.success("Let's create your first README! 🚀", {
          description: "Start writing your amazing GitHub profile README",
        })
      } else if (response.ok) {
        const data: ReadmeData = await response.json()
        const decodedContent = decodeBase64Content(data.content)
        setReadmeData(data)
        setMarkdownContent(decodedContent)
        setOriginalContent(decodedContent)
        setIsNewReadme(false)
        toast.success("README loaded successfully! 📝")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch README")
      }
    } catch (error) {
      console.error("Error fetching README:", error)
      toast.error("Failed to load README", {
        description: error instanceof Error ? error.message : "Please try again or check your connection",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthChecking])

  // Check for changes
  useEffect(() => {
    setHasChanges(markdownContent !== originalContent)
  }, [markdownContent, originalContent])

  // Load README when auth check is complete
  useEffect(() => {
    if (!isAuthChecking) {
      fetchReadme()
    }
  }, [isAuthChecking, fetchReadme])

  // Save/Commit README
  const handleCommit = async () => {
    if (!hasChanges) {
      toast.info("No changes to commit")
      return
    }

    setIsSaving(true)
    try {
      const method = isNewReadme ? "POST" : "PATCH"
      const payload = isNewReadme
        ? {
            content: markdownContent,
            message: "Create README.md",
          }
        : {
            content: markdownContent,
            message: "Update README.md",
            sha: readmeData?.sha,
          }

      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/github/readme`, {
        method,
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        setOriginalContent(markdownContent)
        setHasChanges(false)
        setIsNewReadme(false)

        // Update readme data with new sha
        if (result.content) {
          setReadmeData(result.content)
        }

        toast.success("README committed successfully! 🎉", {
          description: isNewReadme ? "Your first README has been created" : "Changes have been saved to GitHub",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to commit README")
      }
    } catch (error) {
      console.error("Error committing README:", error)
      toast.error("Failed to commit changes", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <main className="min-h-screen bg-[#0F0C14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D3A8FF] mx-auto mb-4" />
          <p className="text-white">Checking authentication...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F0C14] text-white pt-20">
      <div className="container mx-auto max-w-7xl px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="bg-[#1A1625] border-[#3F1469] hover:bg-[#211D2E] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#D3A8FF]">README Editor</h1>
              <p className="text-gray-400 text-sm mt-1">
                {user?.username ? `@${user.username}/${user.username}` : "Loading..."}
              </p>
            </div>
          </div>

          <Button
            onClick={handleCommit}
            disabled={!hasChanges || isSaving}
            className="bg-[#3F1469] hover:bg-[#4a1a7d] text-white"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Committing..." : "Commit changes"}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D3A8FF] mx-auto mb-4" />
              <p className="text-gray-300">Loading your README...</p>
            </div>
          </div>
        ) : (
          /* Editor */
          <Card className="bg-[#171522] border-[#3F1469] h-[calc(100vh-200px)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  README.md
                  {hasChanges && <span className="ml-2 text-xs text-[#D3A8FF]">• Modified</span>}
                </CardTitle>
                <div className="text-sm text-gray-400">
                  {isNewReadme ? "New file" : `${markdownContent.length} characters`}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-80px)]">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Code Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1625] border-b border-[#3F1469]">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Code</span>
                    </div>
                    <div className="flex-1 p-4">
                      <Textarea
                        value={markdownContent}
                        onChange={(e) => setMarkdownContent(e.target.value)}
                        placeholder={
                          isNewReadme
                            ? "# Hi there 👋\n\nWelcome to my GitHub profile!\n\n## About Me\n\n- 🔭 I'm currently working on...\n- 🌱 I'm currently learning...\n- 👯 I'm looking to collaborate on...\n- 💬 Ask me about...\n- 📫 How to reach me: ...\n- ⚡ Fun fact: ..."
                            : "Start editing your README..."
                        }
                        className="w-full h-full bg-[#0F0C14] border-[#3F1469] text-white font-mono text-sm resize-none focus:ring-2 focus:ring-[#3F1469] focus:border-transparent"
                        style={{ minHeight: "100%" }}
                      />
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-[#3F1469]" />

                {/* Preview Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1625] border-b border-[#3F1469]">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Preview</span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto bg-[#0F0C14]">
                      {markdownContent ? (
                        <div className="prose prose-invert prose-purple max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-3xl font-bold text-white mb-4 border-b border-[#3F1469] pb-2">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-2xl font-semibold text-white mb-3 mt-6">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xl font-semibold text-white mb-2 mt-4">{children}</h3>
                              ),
                              p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="text-gray-300 mb-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="text-gray-300 mb-4 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="ml-4">{children}</li>,
                              code: ({ children, className }) => (
                                <code
                                  className={`${
                                    className
                                      ? "block bg-[#1A1625] p-4 rounded-lg border border-[#3F1469] overflow-x-auto"
                                      : "bg-[#1A1625] px-2 py-1 rounded text-[#D3A8FF]"
                                  }`}
                                >
                                  {children}
                                </code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-[#3F1469] pl-4 italic text-gray-400 mb-4">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#D3A8FF] hover:text-[#B78AFF] underline"
                                >
                                  {children}
                                </a>
                              ),
                              img: ({ src, alt }) => (
                                <img
                                  src={src || "/placeholder.svg"}
                                  alt={alt}
                                  className="max-w-full h-auto rounded-lg border border-[#3F1469] my-4"
                                />
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto mb-4">
                                  <table className="min-w-full border border-[#3F1469] rounded-lg">{children}</table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="border border-[#3F1469] px-4 py-2 bg-[#1A1625] text-white font-semibold text-left">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="border border-[#3F1469] px-4 py-2 text-gray-300">{children}</td>
                              ),
                            }}
                          >
                            {markdownContent}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-[#3F1469] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Start Writing</h3>
                            <p className="text-gray-400">
                              {isNewReadme
                                ? "Create your first README to see the preview here"
                                : "Edit your README to see the preview here"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
