import { type NextRequest, NextResponse } from "next/server"
import { ReadmeInputSchema, type ReadmeState } from "@/lib/types"
import { createReadmeGraph } from "@/lib/readme-graph"

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json()
    const validatedInput = ReadmeInputSchema.parse(body)

    const { username, currentContent, isNew, personalInfo } = validatedInput

    // Create streaming response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize the graph
          const graph = createReadmeGraph()

          // Prepare initial state
          const initialState: ReadmeState = {
            username,
            currentContent,
            isNew,
            personalInfo,
          }

          // Execute the graph
          const result = await graph.invoke(initialState)

          // Check for errors
          if (result.error) {
            const errorData = encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: result.error,
              })}\n\n`,
            )
            controller.enqueue(errorData)
            controller.close()
            return
          }

          // Stream the final content
          const finalContent = result.finalContent || ""
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
          console.error("Graph execution error:", error)
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

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input data", details: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to generate README" }, { status: 500 })
  }
}
