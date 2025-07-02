"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const router = useRouter()
  const { isAuthenticated, refreshToken, isLoading: authLoading } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to finish loading
      if (authLoading) {
        return
      }

      try {
        // First check if we have valid tokens
        if (isAuthenticated) {
          setIsAuthed(true)
          setIsLoading(false)
          return
        }

        // Try to refresh the token
        const refreshResult = await refreshToken()
        if (refreshResult) {
          setIsAuthed(true)
        } else {
          // No valid authentication, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, refreshToken, router, authLoading])

  if (isLoading || authLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-[#0F0C14] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D3A8FF] mx-auto mb-4" />
            <p className="text-gray-300">Checking authentication...</p>
          </div>
        </div>
      )
    )
  }

  if (!isAuthed) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
