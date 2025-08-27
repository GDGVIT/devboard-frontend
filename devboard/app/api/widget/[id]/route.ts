import { type NextRequest, NextResponse } from "next/server"

// GitHub API functions
async function fetchGitHubUser(username: string) {
  const response = await fetch(`https://api.github.com/users/${username}`)
  if (!response.ok) throw new Error("User not found")
  return response.json()
}

async function fetchGitHubStats(username: string) {
  // Mock implementation - replace with actual GitHub GraphQL API
  return {
    totalCommitContributions: Math.floor(Math.random() * 2000) + 500,
    totalPullRequestContributions: Math.floor(Math.random() * 200) + 50,
    totalIssueContributions: Math.floor(Math.random() * 100) + 20,
    contributionYears: new Date().getFullYear() - 2018,
    totalStars: Math.floor(Math.random() * 1000) + 100,
  }
}

// Theme definitions
const THEMES = {
  dark: {
    backgroundColor: "#0D1117",
    primaryColor: "#58A6FF",
    secondaryColor: "#21262D",
    textColor: "#F0F6FC",
    accentColor: "#238636",
  },
  light: {
    backgroundColor: "#FFFFFF",
    primaryColor: "#0969DA",
    secondaryColor: "#F6F8FA",
    textColor: "#24292F",
    accentColor: "#1A7F37",
  },
  github: {
    backgroundColor: "#0D1117",
    primaryColor: "#F78166",
    secondaryColor: "#161B22",
    textColor: "#E6EDF3",
    accentColor: "#7C3AED",
  },
  ocean: {
    backgroundColor: "#0F172A",
    primaryColor: "#0EA5E9",
    secondaryColor: "#1E293B",
    textColor: "#F1F5F9",
    accentColor: "#06B6D4",
  },
}

function replaceVariables(content: string, userData: any, stats: any, theme: any) {
  let processedContent = content

  // Replace GitHub variables
  processedContent = processedContent.replace(/\{\{username\}\}/g, userData.login)
  processedContent = processedContent.replace(/\{\{name\}\}/g, userData.name || userData.login)
  processedContent = processedContent.replace(/\{\{bio\}\}/g, userData.bio || "No bio available")
  processedContent = processedContent.replace(/\{\{followers\}\}/g, userData.followers.toString())
  processedContent = processedContent.replace(/\{\{following\}\}/g, userData.following.toString())
  processedContent = processedContent.replace(/\{\{public_repos\}\}/g, userData.public_repos.toString())
  processedContent = processedContent.replace(/\{\{public_gists\}\}/g, userData.public_gists.toString())
  processedContent = processedContent.replace(/\{\{avatar_url\}\}/g, userData.avatar_url)
  processedContent = processedContent.replace(
    /\{\{created_at\}\}/g,
    new Date(userData.created_at).getFullYear().toString(),
  )

  // Replace stats variables
  processedContent = processedContent.replace(
    /\{\{totalCommitContributions\}\}/g,
    stats.totalCommitContributions.toString(),
  )
  processedContent = processedContent.replace(
    /\{\{totalPullRequestContributions\}\}/g,
    stats.totalPullRequestContributions.toString(),
  )
  processedContent = processedContent.replace(
    /\{\{totalIssueContributions\}\}/g,
    stats.totalIssueContributions.toString(),
  )
  processedContent = processedContent.replace(/\{\{contributionYears\}\}/g, stats.contributionYears.toString())
  processedContent = processedContent.replace(/\{\{totalStars\}\}/g, stats.totalStars.toString())

  return processedContent
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const themeName = searchParams.get("theme") || "dark"

    if (!username) {
      return new NextResponse("Username parameter is required", { status: 400 })
    }

    // Fetch widget from your backend
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const widgetResponse = await fetch(`${apiUrl}/api/widget/${params.id}`)

    if (!widgetResponse.ok) {
      return new NextResponse("Widget not found", { status: 404 })
    }

    const widget = await widgetResponse.json()

    // Fetch GitHub data
    const [userData, stats] = await Promise.all([fetchGitHubUser(username), fetchGitHubStats(username)])

    // Get theme
    const theme = THEMES[themeName as keyof typeof THEMES] || THEMES.dark

    // Process widget content
    const processedContent = replaceVariables(widget.content, userData, stats, theme)

    // Generate final SVG
    const svg = `<svg width="${widget.size.width}" height="${widget.size.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${widget.size.width}" height="${widget.size.height}" fill="${theme.backgroundColor}" rx="8"/>
  ${processedContent}
</svg>`

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Widget rendering error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
