"use client"

import { useEffect, useRef } from "react"
import { Poppins } from "next/font/google"
import { ArrowRight } from "lucide-react"

// Initialize the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  return (
    <main className={`min-h-screen bg-[#0F0C14] relative overflow-hidden ${poppins.variable} font-sans`}>
      {/* Background canvas for floating shapes */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ filter: "blur(80px)" }} />

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-white text-2xl font-bold">DevBoard</h1>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#DEC9F0] mb-2 tracking-tight">
          Your Dev Dashboard.
        </h2>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#D3A8FF] mb-8 tracking-tight">
          Built Your Way.
        </h2>

        <p className="text-[#DEC9F0] max-w-lg mb-12 text-sm md:text-base">
          lorem ipsum, lorem ipsum.lorem ipsum,lorem ipsum, lorem ipsum. lorem ipsum. lorem ipsum. lorem ipsum.lorem
          ipsum.lorem ipsum. lorem ipsum.
        </p>

        <button className="group relative bg-[#3F1469] text-white px-8 py-3 rounded-full flex items-center gap-2 overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(211,168,255,0.5)] hover:bg-[#4a1a7d] cursor-pointer">
          <span className="relative z-10">Get started</span>
          <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D3A8FF] to-transparent opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -translate-x-full group-hover:translate-x-full ease-in-out group-hover:duration-1000"></div>
        </button>
      </div>
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
