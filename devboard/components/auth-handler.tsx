"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function AuthHandler() {
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()

  // Handle authentication tokens from URL (since backend redirects to home page)
  useEffect(() => {
    const handleAuthTokens = async () => {
      try {
        const accessToken = searchParams.get("access_token")
        const refreshToken = searchParams.get("refresh_token")
        const error = searchParams.get("error")

        console.log("HOME PAGE - Checking for auth tokens...")
        console.log("URL Tokens:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
          fullURL: window.location.href,
        })

        if (error) {
          console.error("Auth error in URL:", error)
          toast.error("Authentication failed: " + decodeURIComponent(error))
          return
        }

        if (accessToken && refreshToken && !isAuthenticated) {
          console.log("Found tokens in URL, processing login...")
          setIsProcessingAuth(true)
          try {
            await login(accessToken, refreshToken)
            console.log("Login successful from URL tokens")
            toast.success("Successfully logged in!")
            // Clean up URL by removing the tokens
            const cleanUrl = window.location.pathname
            window.history.replaceState({}, document.title, cleanUrl)
          } catch (error) {
            console.error("Login failed:", error)
            toast.error("Login failed: " + (error instanceof Error ? error.message : "Unknown error"))
          } finally {
            setIsProcessingAuth(false)
          }
        }
      } catch (error) {
        console.error("Error handling auth tokens:", error)
        setIsProcessingAuth(false)
      }
    }

    handleAuthTokens()
  }, [searchParams, login, isAuthenticated])

  // Show loading state while processing authentication
  if (isProcessingAuth) {
    return (
      <div className="fixed inset-0 bg-[#0F0C14] flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D3A8FF] mx-auto mb-4" />
          <p className="text-white">Processing authentication...</p>
        </div>
      </div>
    )
  }

  // Return null when not processing auth (component is just for handling auth logic)
  return null
}
