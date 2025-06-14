"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, User, Settings, Github } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Logout failed")
    }
    setIsDropdownOpen(false)
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between p-4">
        {/* DevBoard Logo */}
        <Link href="/">
          <h1 className="text-white text-2xl font-bold cursor-pointer hover:text-[#D3A8FF] transition-colors">
            DevBoard
          </h1>
        </Link>

        {/* User Section */}
        <div className="flex items-center">
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors group"
                  >
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#3F1469] flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url || "/placeholder.svg"}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            const fallback = target.parentElement?.querySelector(".fallback-icon") as HTMLElement
                            if (fallback) {
                              fallback.style.display = "block"
                            }
                          }}
                        />
                      ) : (
                        <Github className="w-5 h-5 text-white" />
                      )}
                      <Github className="w-5 h-5 text-white fallback-icon" style={{ display: "none" }} />
                    </div>

                    {/* Username */}
                    <span className="text-white text-sm">{user.username}</span>

                    {/* Dropdown Arrow */}
                    <ChevronDown
                      className={`w-4 h-4 text-white transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      } group-hover:text-[#D3A8FF]`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#171522] rounded-lg shadow-lg border border-[#3F1469] py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-[#3F1469]">
                        <p className="text-white font-medium">{user.name || user.username}</p>
                        <p className="text-gray-400 text-sm">@{user.username}</p>
                        {user.email && <p className="text-gray-400 text-sm">{user.email}</p>}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push("/profile")
                            setIsDropdownOpen(false)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:bg-[#211D2E] hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            router.push("/settings")
                            setIsDropdownOpen(false)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:bg-[#211D2E] hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>

                        <div className="border-t border-[#3F1469] my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="w-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-white hover:text-[#D3A8FF] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
