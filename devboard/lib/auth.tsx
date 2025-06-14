"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

// Types
export interface User {
  username: string
  avatar_url?: string
  name?: string
  email?: string
  exp: number
  iat: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  clearError: () => void
}

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://140.245.225.60"
const ACCESS_TOKEN_KEY = "devboard_access_token"
const REFRESH_TOKEN_KEY = "devboard_refresh_token"

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple localStorage utilities
const setToken = (key: string, value: string): boolean => {
  if (typeof window === "undefined") return false

  try {
    localStorage.setItem(key, value)
    console.log(`✅ Token stored: ${key}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to store token ${key}:`, error)
    return false
  }
}

const getToken = (key: string): string | null => {
  if (typeof window === "undefined") return null

  try {
    const token = localStorage.getItem(key)
    console.log(`🔍 Token retrieved: ${key} = ${token ? "EXISTS" : "NULL"}`)
    return token
  } catch (error) {
    console.error(`❌ Failed to retrieve token ${key}:`, error)
    return null
  }
}

const clearTokens = (): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    console.log("🗑️ All tokens cleared")
  } catch (error) {
    console.error("❌ Failed to clear tokens:", error)
  }
}

// JWT utilities
const parseJWT = (token: string): any => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("❌ Error parsing JWT:", error)
    return null
  }
}

const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token)
  if (!payload || !payload.exp) return true

  const currentTime = Math.floor(Date.now() / 1000)
  const bufferTime = 60
  return payload.exp <= currentTime + bufferTime
}

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    console.log("🚀 Initializing auth...")

    try {
      const accessToken = getToken(ACCESS_TOKEN_KEY)
      const refreshToken = getToken(REFRESH_TOKEN_KEY)

      console.log("🔍 Token check:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      })

      if (!accessToken || !refreshToken) {
        console.log("❌ No tokens found, setting unauthenticated")
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
        return
      }

      // Check if access token is expired
      if (isTokenExpired(accessToken)) {
        console.log("⏰ Access token expired, attempting refresh...")
        const refreshSuccess = await performTokenRefresh()
        if (!refreshSuccess) {
          console.log("❌ Token refresh failed")
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          return
        }
      }

      // Parse user data from current token
      const currentToken = getToken(ACCESS_TOKEN_KEY)
      if (currentToken) {
        const userData = parseJWT(currentToken)
        console.log("👤 Parsed user data:", userData)

        if (userData) {
          const user: User = {
            username: userData.username,
            avatar_url: userData.avatar_url,
            name: userData.name,
            email: userData.email,
            exp: userData.exp,
            iat: userData.iat,
          }

          console.log("✅ Setting authenticated user:", user.username)
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } else {
          console.log("❌ Failed to parse user data")
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      }
    } catch (error) {
      console.error("❌ Auth initialization error:", error)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to initialize authentication",
      })
    }
  }, [])

  // Login function
  const login = useCallback(async (accessToken: string, refreshToken: string): Promise<void> => {
    console.log("🔐 LOGIN FUNCTION CALLED")
    console.log("📝 Received tokens:", {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : "NULL",
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : "NULL",
    })

    try {
      // Store tokens
      const accessSuccess = setToken(ACCESS_TOKEN_KEY, accessToken)
      const refreshSuccess = setToken(REFRESH_TOKEN_KEY, refreshToken)

      if (!accessSuccess || !refreshSuccess) {
        throw new Error("Failed to store tokens")
      }

      console.log("💾 Tokens stored successfully")

      // Parse user data
      const userData = parseJWT(accessToken)
      console.log("👤 Parsing user data:", userData)

      if (!userData) {
        throw new Error("Invalid access token")
      }

      const user: User = {
        username: userData.username,
        avatar_url: userData.avatar_url,
        name: userData.name,
        email: userData.email,
        exp: userData.exp,
        iat: userData.iat,
      }

      console.log("✅ Setting user state:", user.username)

      // Update state immediately
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      console.log("🎉 Login completed successfully!")
    } catch (error) {
      console.error("❌ Login error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      }))
      throw error
    }
  }, [])

  // Token refresh function
  const performTokenRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = getToken(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      console.log("🔄 Attempting token refresh...")

      const response = await fetch(`${API_BASE_URL}/api/auth/access-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Token refresh failed")
      }

      const data = await response.json()

      // Store new access token
      setToken(ACCESS_TOKEN_KEY, data.access_token)

      // Update user data with new token
      const userData = parseJWT(data.access_token)
      if (userData) {
        const user: User = {
          username: userData.username,
          avatar_url: userData.avatar_url,
          name: userData.name,
          email: userData.email,
          exp: userData.exp,
          iat: userData.iat,
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      }

      console.log("✅ Token refresh successful")
      return true
    } catch (error) {
      console.error("❌ Token refresh error:", error)
      clearTokens()

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      return false
    }
  }, [])

  // Public refresh function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    return await performTokenRefresh()
  }, [performTokenRefresh])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      const accessToken = getToken(ACCESS_TOKEN_KEY)

      if (accessToken) {
        console.log("📤 Calling logout API...")
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          console.log("✅ Logout API call successful")
        } catch (apiError) {
          console.error("❌ Logout API failed:", apiError)
          // Continue with local logout even if API fails
        }
      }
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
      console.log("🚪 Clearing tokens and logging out")
      clearTokens()

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Authenticated fetch utility
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = getToken(ACCESS_TOKEN_KEY)

  if (!accessToken) {
    throw new Error("No access token available")
  }

  if (isTokenExpired(accessToken)) {
    throw new Error("Access token expired")
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
