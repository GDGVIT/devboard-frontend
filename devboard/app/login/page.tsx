"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Poppins } from "next/font/google"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

// Initialize the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://140.245.225.60"

export default function LoginPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  // Handle tokens when they come back from backend
  useEffect(() => {
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
        return
      }

      if (accessToken && refreshToken) {
        console.log("✅ Tokens found, logging in...")
        setIsLoading(true)

        try {
          await login(accessToken, refreshToken)
          toast.success("Login successful!")
          router.push("/")
        } catch (error) {
          console.error("❌ Login failed:", error)
          toast.error("Login failed")
        } finally {
          setIsLoading(false)
        }
      }
    }

    handleTokens()
  }, [searchParams, login, router])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create floating shapes
    const shapes: Shape[] = []
    const colors = ["#3F1469"]

    for (let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 80 + 20,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw shapes
      shapes.forEach((shape) => {
        ctx.beginPath()
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${shape.color}${Math.floor(shape.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        // Update position
        shape.x += shape.dx
        shape.y += shape.dy

        // Bounce off edges with some buffer
        if (shape.x < -shape.radius || shape.x > canvas.width + shape.radius) {
          shape.dx = -shape.dx
        }

        if (shape.y < -shape.radius || shape.y > canvas.height + shape.radius) {
          shape.dy = -shape.dy
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  const handleGitHubLogin = () => {
    if (isLoading) return

    setIsLoading(true)

    // Create the callback URL for the current environment
    const callbackUrl = `${window.location.origin}/login`

    // Redirect directly to the backend auth endpoint
    const authUrl = `${API_BASE_URL}/api/auth/login?callback_url=${encodeURIComponent(callbackUrl)}`
    window.location.href = authUrl
  }

  return (
    <main className={`min-h-screen bg-[#0F0C14] relative overflow-hidden ${poppins.variable} font-sans`}>
      {/* Background canvas for floating shapes */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ filter: "blur(80px)" }} />

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <Link href="/">
          <h1 className="text-white text-2xl font-bold cursor-pointer hover:text-[#D3A8FF] transition-colors">
            DevBoard
          </h1>
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-[#171522] rounded-3xl w-full max-w-md overflow-hidden">
          {/* Main card content */}
          <div className="px-8 pt-14 pb-16">
            <div className="text-center mb-16">
              <h2 className="text-white text-3xl font-medium mb-3">Sign In</h2>
              <p className="text-gray-300 text-base">Welcome back! Please sign in to continue</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="relative bg-[#0E0C1A] text-white rounded-full py-3.5 px-6 flex items-center justify-center gap-3 w-full max-w-xs cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                )}
                <span className="text-lg">{isLoading ? "Processing..." : "Continue with Github"}</span>
                {!isLoading && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  ></div>
                )}
              </button>
            </div>
          </div>

          {/* Bottom section */}
          <div className="bg-[#0D0B13] py-5 px-8 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#9C5FFF] hover:text-[#B78AFF] transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* CSS for the shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </main>
  )
}

// Types
interface Shape {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
  color: string
  opacity: number
}
