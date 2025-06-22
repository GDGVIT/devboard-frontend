import { type NextRequest, NextResponse } from "next/server"
import { portfolioGraph } from "@/lib/portfolio-workflow"

export async function POST(request: NextRequest) {
  try {
    const { content, customMessage, style } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Create a readable stream for real-time updates
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize the workflow state
          const initialState = {
            content,
            customMessage: customMessage || "",
            style: style || "minimal",
            parsedData: "",
            portfolioCode: "",
            currentStep: "parsing",
            progress: 0,
            error: null,
          }

          // Stream the workflow execution
          const config = { configurable: { thread_id: "portfolio-gen-" + Date.now() } }

          for await (const event of await portfolioGraph.stream(initialState, config)) {
            const chunk = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            controller.enqueue(chunk)
          }

          // Send completion signal
          const completionChunk = encoder.encode(`data: ${JSON.stringify({ type: "complete" })}\n\n`)
          controller.enqueue(completionChunk)
          controller.close()
        } catch (error) {
          console.error("Portfolio generation error:", error)
          const errorChunk = encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`,
          )
          controller.enqueue(errorChunk)
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
    return NextResponse.json({ error: "Failed to generate portfolio" }, { status: 500 })
  }
}
