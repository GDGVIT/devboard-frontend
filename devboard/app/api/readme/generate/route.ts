import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

export async function POST(request: NextRequest) {
  try {
    const { username, currentContent, isNew } = await request.json()

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
               Consider what kind of developer they might be and suggest appropriate sections.
               Return a brief analysis of what should be included in their README.`
            : `Analyze this existing README content and suggest improvements:
               
               ${currentContent}
               
               Provide analysis on what's good, what's missing, and what could be improved.`

          const analysisResult = await model.generateContent(analysisPrompt)
          const analysis = analysisResult.response.text()

          // Step 2: Generate
          const generatePrompt = isNew
            ? `Based on this analysis: ${analysis}
               
               Create a comprehensive GitHub profile README for username "${username}".
               Include these sections:
               - Header with greeting and name
               - About Me section
               - Skills and Technologies
               - Current Projects
               - GitHub Stats
               - Connect with Me
               
               Make it engaging, professional, and use appropriate emojis.
               Return ONLY the markdown content, no explanations.`
            : `Based on this analysis: ${analysis}
               
               Improve this existing README content:
               ${currentContent}
               
               Make it more engaging, add missing sections, and improve the overall structure.
               Return ONLY the improved markdown content, no explanations.`

          const generateResult = await model.generateContent(generatePrompt)
          const generatedContent = generateResult.response.text()

          // Step 3: Review and Polish
          const reviewPrompt = `Review and refine this generated README content:
          
          ${generatedContent}
          
          Check for:
          - Proper markdown formatting
          - Engaging and professional tone
          - Complete sections
          - Appropriate use of emojis
          - Clear structure
          
          Return the final, polished README content. Return ONLY the markdown, no explanations.`

          const reviewResult = await model.generateContent(reviewPrompt)
          const finalContent = reviewResult.response.text()

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
