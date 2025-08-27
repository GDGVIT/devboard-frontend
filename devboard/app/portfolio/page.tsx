"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, Copy, Download, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface GenerationState {
  currentStep: string
  progress: number
  parsedData: string
  portfolioCode: string
  error: string | null
}

export default function PortfolioGenerator() {
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [style, setStyle] = useState("minimal")
  const [generationState, setGenerationState] = useState<GenerationState>({
    currentStep: "",
    progress: 0,
    parsedData: "",
    portfolioCode: "",
    error: null,
  })
  const [streamingCode, setStreamingCode] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLPreElement>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Auto-scroll to bottom of code as it streams
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight
    }
  }, [streamingCode])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const text = await file.text()
      setContent(text)
      toast.success(`${file.name} uploaded successfully`)
    } catch (error) {
      toast.error("Error uploading file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to generate your portfolio")
      router.push("/login")
      return
    }

    if (!content) {
      toast.error("Please upload a README or resume first")
      return
    }

    setIsGenerating(true)
    setStreamingCode("")
    setGenerationState({
      currentStep: "starting",
      progress: 0,
      parsedData: "",
      portfolioCode: "",
      error: null,
    })

    try {
      const response = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, customMessage, style }),
      })

      if (!response.ok) {
        throw new Error("Failed to start generation")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === "complete") {
                  setIsGenerating(false)
                  toast.success("Portfolio generated successfully!")
                  break
                }

                if (data.type === "error") {
                  throw new Error(data.error)
                }

                // Update generation state
                if (data.currentStep || data.progress !== undefined) {
                  setGenerationState((prev) => ({
                    ...prev,
                    currentStep: data.currentStep || prev.currentStep,
                    progress: data.progress !== undefined ? data.progress : prev.progress,
                    parsedData: data.parsedData || prev.parsedData,
                    portfolioCode: data.portfolioCode || prev.portfolioCode,
                  }))
                }

                // Handle streaming code generation
                if (data.currentStep === "generating" && data.portfolioCode) {
                  setStreamingCode(data.portfolioCode)
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast.error("Failed to generate portfolio")
      setGenerationState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        currentStep: "error",
      }))
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generationState.portfolioCode || streamingCode)
      toast.success("Code copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy code")
    }
  }

  const downloadCode = () => {
    const code = generationState.portfolioCode || streamingCode
    const blob = new Blob([code], { type: "text/javascript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Portfolio.jsx"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Code downloaded!")
  }

  const getStepDescription = (step: string) => {
    switch (step) {
      case "starting":
        return "Initializing portfolio generation..."
      case "parsing":
        return "Analyzing your content and extracting key information..."
      case "generating":
        return "Generating your React portfolio code..."
      case "complete":
        return "Portfolio generation completed!"
      case "error":
        return "An error occurred during generation"
      default:
        return "Processing..."
    }
  }

  return (
    <main className="min-h-screen bg-[#0F0C14] text-white pt-20">
      <div className="container mx-auto max-w-6xl px-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-[#1A1625] border-[#3F1469] hover:bg-[#211D2E] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#D3A8FF]">Portfolio Generator</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration Panel */}
          <Card className="bg-[#171522] border-[#3F1469]">
            <CardHeader>
              <CardTitle className="text-white">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="upload" className="text-white mb-2 block">
                  Upload README/Resume
                </Label>
                <Button
                  variant="outline"
                  className="w-full bg-[#1A1625] border-[#3F1469] hover:bg-[#211D2E] text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isGenerating}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".md,.txt,.pdf"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Content Textarea */}
              <div>
                <Label htmlFor="content" className="text-white mb-2 block">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your README or resume content here..."
                  className="h-32 bg-[#1A1625] border-[#3F1469] text-white resize-none"
                  disabled={isGenerating}
                />
              </div>

              {/* Style Selection */}
              <div>
                <Label htmlFor="style" className="text-white mb-2 block">
                  Design Style
                </Label>
                <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                  <SelectTrigger className="bg-[#1A1625] border-[#3F1469] text-white">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1625] border-[#3F1469]">
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="dark">Dark Theme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Message */}
              <div>
                <Label htmlFor="message" className="text-white mb-2 block">
                  Custom Requirements
                </Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Any specific requirements or features you'd like..."
                  className="h-24 bg-[#1A1625] border-[#3F1469] text-white resize-none"
                  disabled={isGenerating}
                />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-[#3F1469] hover:bg-[#4a1a7d] text-white"
                onClick={handleGenerate}
                disabled={isGenerating || !content}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Portfolio"
                )}
              </Button>

              {/* Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{getStepDescription(generationState.currentStep)}</span>
                    <span className="text-[#D3A8FF]">{generationState.progress}%</span>
                  </div>
                  <Progress value={generationState.progress} className="bg-[#1A1625]" />
                </div>
              )}

              {/* Error Display */}
              {generationState.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{generationState.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Display Panel */}
          <Card className="bg-[#171522] border-[#3F1469]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Generated Code</CardTitle>
                {(generationState.portfolioCode || streamingCode) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="bg-[#1A1625] border-[#3F1469] hover:bg-[#211D2E] text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                      className="bg-[#1A1625] border-[#3F1469] hover:bg-[#211D2E] text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] bg-[#0F0C14] rounded-lg border border-[#3F1469] overflow-hidden">
                {generationState.portfolioCode || streamingCode ? (
                  <pre
                    ref={codeRef}
                    className="h-full overflow-auto p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap"
                  >
                    <code>{streamingCode || generationState.portfolioCode}</code>
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#3F1469] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
                      <p className="text-gray-400">
                        Upload your content and click generate to see your React portfolio code appear here in
                        real-time.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
