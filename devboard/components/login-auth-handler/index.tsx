"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function LoginAuthHandler() {
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  const hasProcessedTokens = useRef(false)

  // Redirect if already authenticated - only run once when isAuthenticated changes
  useEffect(() => {
    if (isAuthenticated && !isProcessingAuth) {
      router.push("/")
    }
  }, [isAuthenticated, router, isProcessingAuth])

  // Handle tokens when they come back from backend - only run once
  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessedTokens.current) return

    const handleTokens = async () => {
      const accessToken = searchParams.get("access_token")
      const refreshToken = searchParams.get("refresh_token")
      const error = searchParams.get("error")

      console.log("🔐 LOGIN PAGE - Checking for tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        error,
      })

      if (error) {
        toast.error("Authentication failed: " + decodeURIComponent(error))
        hasProcessedTokens.current = true
        return
      }

      if (accessToken && refreshToken) {
        console.log("✅ Tokens found, logging in...")
        hasProcessedTokens.current = true
        setIsProcessingAuth(true)

        try {
          await login(accessToken, refreshToken)
          toast.success("Login successful!")
          // Clean up URL
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
          router.push("/")
        } catch (error) {
          console.error("❌ Login failed:", error)
          toast.error("Login failed")
        } finally {
          setIsProcessingAuth(false)
        }
      } else {
        hasProcessedTokens.current = true
      }
    }

    handleTokens()
  }, []) // Empty dependency array - only run once on mount

  // Show loading overlay while processing authentication
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
