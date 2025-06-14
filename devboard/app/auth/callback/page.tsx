"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()    
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("🔄 AUTH CALLBACK STARTED")
        console.log("🌐 Current URL:", window.location.href)
        console.log("📋 All URL params:", Object.fromEntries(searchParams.entries()))

        // Get tokens from query parameters
        const accessToken = searchParams.get("access-token")
        const refreshToken = searchParams.get("refreshtoken")
        const error = searchParams.get("error")

        console.log("🎫 Extracted tokens:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
        })

        if (error) {
          throw new Error(decodeURIComponent(error))
        }

        if (!accessToken || !refreshToken) {
          console.error("❌ Missing tokens in URL")
          throw new Error("Missing authentication tokens in callback URL")
        }

        console.log("🔐 Calling login function...")
        await login(accessToken, refreshToken)
        console.log("✅ Login function completed")

        setStatus("success")
        setMessage("Successfully authenticated! Redirecting...")

        toast.success("Login successful!")

        // Redirect to home page
        setTimeout(() => {
          console.log("🏠 Redirecting to home...")
          router.push("/")
        }, 1500)
      } catch (error) {
        console.error("❌ Authentication callback error:", error)
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Authentication failed")

        toast.error("Authentication failed")

        // Redirect to login
        setTimeout(() => {
          console.log("🔙 Redirecting to login...")
          router.push("/login")
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router, login])

  return (
    <main className="min-h-screen bg-[#0F0C14] flex items-center justify-center px-4">
      <div className="bg-[#171522] rounded-3xl w-full max-w-md p-8 text-center">
        <div className="mb-6">
          {status === "loading" && <Loader2 className="w-16 h-16 animate-spin text-[#D3A8FF] mx-auto" />}
          {status === "success" && <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />}
          {status === "error" && <XCircle className="w-16 h-16 text-red-500 mx-auto" />}
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4">
          {status === "loading" && "Authenticating..."}
          {status === "success" && "Success!"}
          {status === "error" && "Authentication Failed"}
        </h2>

        <p className="text-gray-300 mb-6">{message || "Processing your authentication..."}</p>

        {status === "error" && (
          <button
            onClick={() => router.push("/login")}
            className="bg-[#3F1469] hover:bg-[#4a1a7d] text-white px-6 py-2 rounded-full transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </main>
  )
}
