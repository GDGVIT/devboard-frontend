"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, MapPin, LinkIcon, Star, Building, Clock, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

function ProfileContent() {
  const { user, isAuthenticated } = useAuth()
  const [githubData, setGithubData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchGitHubProfile = async () => {
      if (!user?.username) return

      try {
        const response = await fetch(`https://api.github.com/users/${user.username}`)
        if (response.ok) {
          const data = await response.json()
          setGithubData(data)
        }
      } catch (error) {
        console.error("Failed to fetch GitHub profile:", error)
        toast.error("Failed to load GitHub profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGitHubProfile()
  }, [user])

  if (!isAuthenticated || !user) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  return (
    <main className="min-h-screen bg-[#0F0C14] pt-20 pb-8">
      <div className="container mx-auto max-w-4xl px-4">
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
          <h1 className="text-3xl font-bold text-[#D3A8FF]">Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="bg-[#171522] border-[#3F1469]">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-[#3F1469] flex items-center justify-center">
                    {githubData?.avatar_url || user.avatar_url ? (
                      <img
                        src={githubData?.avatar_url || user.avatar_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>

                  {/* Basic Info */}
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {githubData?.name || user.name || user.username}
                  </h2>
                  <p className="text-gray-400 mb-2">@{user.username}</p>

                  {githubData?.bio && <p className="text-gray-300 text-sm mb-4">{githubData.bio}</p>}

                  {/* GitHub Stats */}
                  {githubData && (
                    <div className="flex gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatNumber(githubData.followers)}</div>
                        <div className="text-gray-400 text-xs">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatNumber(githubData.following)}</div>
                        <div className="text-gray-400 text-xs">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatNumber(githubData.public_repos)}</div>
                        <div className="text-gray-400 text-xs">Repos</div>
                      </div>
                    </div>
                  )}

                  {/* GitHub Profile Link */}
                  {githubData?.html_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(githubData.html_url, "_blank")}
                      className="bg-[#1A1625] border-[#3F1469] hover:bg-[#211D2E] text-white"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      View on GitHub
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="bg-[#171522] border-[#3F1469]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{user.email}</span>
                  </div>
                )}

                {githubData?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{githubData.location}</span>
                  </div>
                )}

                {githubData?.company && (
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{githubData.company}</span>
                  </div>
                )}

                {githubData?.blog && (
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <a
                      href={githubData.blog.startsWith("http") ? githubData.blog : `https://${githubData.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D3A8FF] hover:text-[#B78AFF] transition-colors"
                    >
                      {githubData.blog}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="bg-[#171522] border-[#3F1469]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-white font-medium">{user.username}</p>
                  </div>

                  {githubData?.created_at && (
                    <div>
                      <p className="text-gray-400 text-sm">GitHub Member Since</p>
                      <p className="text-white font-medium">{formatDate(githubData.created_at)}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-400 text-sm">Login Session</p>
                    <p className="text-white font-medium">{formatDate(new Date(user.iat * 1000).toISOString())}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Session Expires</p>
                    <p className="text-white font-medium">{formatDate(new Date(user.exp * 1000).toISOString())}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Activity */}
            {githubData && (
              <Card className="bg-[#171522] border-[#3F1469]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    GitHub Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-[#1A1625] rounded-lg">
                      <div className="text-2xl font-bold text-[#D3A8FF] mb-1">
                        {formatNumber(githubData.public_repos)}
                      </div>
                      <div className="text-gray-400 text-sm">Public Repos</div>
                    </div>

                    <div className="text-center p-4 bg-[#1A1625] rounded-lg">
                      <div className="text-2xl font-bold text-[#D3A8FF] mb-1">{formatNumber(githubData.followers)}</div>
                      <div className="text-gray-400 text-sm">Followers</div>
                    </div>

                    <div className="text-center p-4 bg-[#1A1625] rounded-lg">
                      <div className="text-2xl font-bold text-[#D3A8FF] mb-1">{formatNumber(githubData.following)}</div>
                      <div className="text-gray-400 text-sm">Following</div>
                    </div>

                    {githubData.public_gists !== undefined && (
                      <div className="text-center p-4 bg-[#1A1625] rounded-lg">
                        <div className="text-2xl font-bold text-[#D3A8FF] mb-1">
                          {formatNumber(githubData.public_gists)}
                        </div>
                        <div className="text-gray-400 text-sm">Public Gists</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
