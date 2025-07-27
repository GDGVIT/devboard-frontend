"use client"

import { useEffect, useRef } from "react"
import { Poppins } from "next/font/google"
import { ArrowRight, Plus, FileText } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Initialize the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isAuthenticated, isLoading } = useAuth()

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

  const handleCreateWidget = () => {
    window.location.href = "/widget"
  }

  const handleReadme = () => {
    window.location.href = "/readme"
  }

  const handleGetStarted = () => {
    window.location.href = "/login"
  }

  return (
    <main className={`min-h-screen bg-[#0F0C14] relative overflow-hidden ${poppins.variable} font-sans`}>
      {/* Background canvas for floating shapes */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ filter: "blur(80px)" }} />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#DEC9F0] mb-2 tracking-tight">
          Your Dev Dashboard.
        </h2>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#D3A8FF] mb-8 tracking-tight">
          Built Your Way.
        </h2>
        <p className="text-[#DEC9F0] max-w-lg mb-12 text-sm md:text-base">
          Create your own custom widgets. No coding required, just drag and drop!
          Perfect for developers who want a personalized workspace.
        </p>

        {/* Conditional button rendering */}
        {!isLoading && (
          <>
            {!isAuthenticated ? (
              // Single "Get Started" button for non-authenticated users
              <button
                onClick={handleGetStarted}
                className="relative bg-[#0E0C1A] text-white rounded-full px-8 py-3 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
                }}
              >
                <span className="text-lg">Get Started</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </button>
            ) : (
              // Two buttons side by side for authenticated users
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={handleCreateWidget}
                  className="relative bg-[#3F1469] text-white rounded-full px-8 py-3 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                  style={{
                    boxShadow: "0 0 0 1px rgba(211, 168, 255, 0.2), 0 0 20px 0px rgba(63, 20, 105, 0.4)",
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-lg">Create Widget</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(211, 168, 255, 0.2), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </button>

                <button
                  onClick={handleReadme}
                  className="relative bg-[#0E0C1A] text-white rounded-full px-8 py-3 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                  style={{
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px 0px rgba(103, 58, 183, 0.3)",
                  }}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-lg">Readme</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
