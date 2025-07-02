import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

// Function to clean markdown content
function cleanMarkdownContent(content: string): string {
  // Remove markdown code block syntax from the beginning and end
  let cleaned = content.trim()

  // Remove \`\`\`markdown or \`\`\`md from the beginning
  cleaned = cleaned.replace(/^```(?:markdown|md)\s*\n?/i, "")

  // Remove \`\`\` from the end
  cleaned = cleaned.replace(/\n?```\s*$/i, "")

  // Remove any remaining code block markers that might be at the start
  cleaned = cleaned.replace(/^```\s*\n?/i, "")

  // Ensure proper spacing and clean up any extra whitespace
  cleaned = cleaned.trim()

  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const { username, currentContent, isNew, personalInfo } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Create streaming response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Analyze
          const analysisPrompt = isNew
            ? `Analyze the username "${username}" and create a professional analysis for a GitHub README.

     Personal Information:
     - Field: ${personalInfo?.field || "Not specified"}
     - Experience: ${personalInfo?.experience || "Not specified"}  
     - Skills: ${personalInfo?.skills || "Not specified"}
     - Interests: ${personalInfo?.interests || "Not specified"}
     - Goals: ${personalInfo?.goals || "Not specified"}

     Consider what kind of developer they are and suggest appropriate sections.
     Return a brief analysis of what should be included in their README.`
            : `Analyze this existing README content and suggest improvements:

     ${currentContent}

     Personal Information for enhancement:
     - Field: ${personalInfo?.field || "Not specified"}
     - Experience: ${personalInfo?.experience || "Not specified"}
     - Skills: ${personalInfo?.skills || "Not specified"}
     - Interests: ${personalInfo?.interests || "Not specified"}
     - Goals: ${personalInfo?.goals || "Not specified"}

     Provide analysis on what's good, what's missing, and what could be improved.`

          const analysisResult = await model.generateContent(analysisPrompt)
          const analysis = analysisResult.response.text()

          // Step 2: Generate
          const generatePrompt = isNew
            ? `Based on this analysis: ${analysis}

     Create a comprehensive GitHub profile README for username "${username}".

     Personal Details:
     - Field: ${personalInfo?.field || "Developer"}
     - Experience Level: ${personalInfo?.experience || "Not specified"}
     - Main Skills: ${personalInfo?.skills || "Various technologies"}
     - Current Interests: ${personalInfo?.interests || "Learning new technologies"}
     - Goals: ${personalInfo?.goals || "Growing as a developer"}

     Create a well-formatted markdown README with proper spacing and structure. Include these sections:

     # Hi, I'm ${username}! 👋

     ## About Me
     Write a compelling about section based on their field and experience

     ## 🚀 Skills & Technologies
     List their skills in a well-organized format using bullet points

     ## 🌱 Currently Learning
     Based on their interests

     ## 🎯 Goals
     Based on their goals

     ## 📊 GitHub Stats
     [GitHub stats widget]

     ![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical)

     ## 💡 Daily Quote
     [Daily quote widget]

     ## 👀 Profile Views
     [Profile views widget]

     ## 📫 Connect with Me
     Add contact information and social links

     CRITICAL FORMATTING REQUIREMENTS:
     - Return ONLY the raw markdown content
     - DO NOT wrap the response in code blocks
     - DO NOT include \`\`\`markdown or \`\`\` anywhere in the response
     - Start directly with the # Hi, I'm ${username}! 👋 header
     - Use proper line breaks between sections (double line breaks)
     - Use bullet points with - or * for lists
     - Ensure proper spacing around headers
     - Make sure all markdown syntax is clean and properly formatted
     - Use emojis appropriately for visual appeal

     Return ONLY the markdown content with perfect formatting. No code blocks, no explanations.`
            : `Based on this analysis: ${analysis}
               
               Improve this existing README content:
               ${currentContent}
               
               Add missing sections like GitHub stats, profile views, and daily quotes.
               Ensure proper markdown formatting with clean spacing and structure.
               
               CRITICAL: Return ONLY the raw markdown content without any code block wrappers.
               DO NOT include \`\`\`markdown or \`\`\` in your response.
               Return ONLY the improved markdown content.`

          const generateResult = await model.generateContent(generatePrompt)
          let generatedContent = generateResult.response.text()

          // Clean the generated content
          generatedContent = cleanMarkdownContent(generatedContent)

          // Step 3: Review and Polish
          const reviewPrompt = `Review and refine this generated README content:

          ${generatedContent}

          Ensure:
          - Proper markdown formatting with clean line breaks between sections
          - Well-structured sections with appropriate spacing
          - Professional and engaging tone
          - Proper use of headers, lists, and formatting
          - Clean, readable structure
          - All GitHub stats widgets are properly formatted
          - Profile views and daily quote widgets are included

          CRITICAL REQUIREMENT: Return ONLY the raw markdown content.
          DO NOT wrap your response in code blocks.
          DO NOT include \`\`\`markdown or \`\`\` anywhere in the response.
          Return the final, polished README content as plain markdown text only.`

          const reviewResult = await model.generateContent(reviewPrompt)
          let finalContent = reviewResult.response.text()

          // Clean the final content to ensure no markdown code blocks
          finalContent = cleanMarkdownContent(finalContent)

          // Additional validation to ensure content is clean
          if (finalContent.includes("```")) {
            // If there are still code blocks, remove them more aggressively
            finalContent = finalContent.replace(/```[\s\S]*?```/g, "")
            finalContent = finalContent.replace(/```.*$/gm, "")
            finalContent = finalContent.trim()
          }

          // Stream the final content character by character for effect
          const chunkSize = 10
          for (let i = 0; i < finalContent.length; i += chunkSize) {
            const chunk = finalContent.slice(i, i + chunkSize)
            const data = encoder.encode(
              `data: ${JSON.stringify({
                type: "content",
                content: chunk,
              })}\n\n`,
            )
            controller.enqueue(data)
            // Small delay for streaming effect
            await new Promise((resolve) => setTimeout(resolve, 50))
          }

          // Send completion signal
          const completeData = encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              finalContent: finalContent,
            })}\n\n`,
          )
          controller.enqueue(completeData)
          controller.close()
        } catch (error) {
          console.error("Generation error:", error)
          const errorData = encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`,
          )
          controller.enqueue(errorData)
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Failed to generate README" }, { status: 500 })
  }
}
