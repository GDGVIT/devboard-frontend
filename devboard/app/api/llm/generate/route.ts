import { type NextRequest, NextResponse } from "next/server"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash-exp",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  streaming: true,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const messages = []
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt })
    }
    messages.push({ role: "user", content: prompt })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamResponse = await model.stream(messages)

          for await (const chunk of streamResponse) {
            const content = chunk.content
            if (content) {
              const data = encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              controller.enqueue(data)
            }
          }

          const endChunk = encoder.encode(`data: ${JSON.stringify({ type: "end" })}\n\n`)
          controller.enqueue(endChunk)
          controller.close()
        } catch (error) {
          console.error("LLM streaming error:", error)
          const errorChunk = encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "LLM generation failed",
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
    console.error("LLM API route error:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
