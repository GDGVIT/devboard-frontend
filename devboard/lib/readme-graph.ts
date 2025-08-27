import { StateGraph, END } from "@langchain/langgraph"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import type { ReadmeState } from "./types"
import { cleanMarkdownContent, createAnalysisPrompt, createGenerationPrompt, createReviewPrompt } from "./utils"

// Initialize the model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
})

// Analysis Node
async function analyzeNode(state: ReadmeState): Promise<Partial<ReadmeState>> {
  try {
    const prompt = createAnalysisPrompt(state)
    const response = await model.invoke(prompt)

    return {
      analysis: response.content as string,
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return {
      error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Generation Node
async function generateNode(state: ReadmeState): Promise<Partial<ReadmeState>> {
  try {
    if (state.error) {
      return { error: state.error }
    }

    const prompt = createGenerationPrompt(state)
    const response = await model.invoke(prompt)
    let content = response.content as string

    // Clean the generated content
    content = cleanMarkdownContent(content)

    return {
      generatedContent: content,
    }
  } catch (error) {
    console.error("Generation error:", error)
    return {
      error: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Review Node
async function reviewNode(state: ReadmeState): Promise<Partial<ReadmeState>> {
  try {
    if (state.error) {
      return { error: state.error }
    }

    const prompt = createReviewPrompt(state)
    const response = await model.invoke(prompt)
    let content = response.content as string

    // Clean the final content
    content = cleanMarkdownContent(content)

    // Additional validation to ensure content is clean
    if (content.includes("```")) {
      // If there are still code blocks, remove them more aggressively
      content = content.replace(/```[\s\S]*?```/g, "")
      content = content.replace(/```.*$/gm, "")
      content = content.trim()
    }

    return {
      finalContent: content,
    }
  } catch (error) {
    console.error("Review error:", error)
    return {
      error: `Review failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Conditional edge functions
function shouldContinueFromAnalyze(state: ReadmeState): "continue" | "end" {
  if (state.error) {
    return "end"
  }
  return "continue"
}

function shouldContinueFromGenerate(state: ReadmeState): "continue" | "end" {
  if (state.error) {
    return "end"
  }
  return "continue"
}

// Create the graph using method chaining
export function createReadmeGraph() {
  const graph = new StateGraph<ReadmeState>({
    channels: {
      username: {
        value: (x: string, y?: string) => y ?? x,
        default: () => "",
      },
      currentContent: {
        value: (x?: string, y?: string) => y ?? x,
        default: () => undefined,
      },
      isNew: {
        value: (x: boolean, y?: boolean) => y ?? x,
        default: () => true,
      },
      personalInfo: {
        value: (x?: any, y?: any) => y ?? x,
        default: () => undefined,
      },
      analysis: {
        value: (x?: string, y?: string) => y ?? x,
        default: () => undefined,
      },
      generatedContent: {
        value: (x?: string, y?: string) => y ?? x,
        default: () => undefined,
      },
      finalContent: {
        value: (x?: string, y?: string) => y ?? x,
        default: () => undefined,
      },
      error: {
        value: (x?: string, y?: string) => y ?? x,
        default: () => undefined,
      },
    },
  })
    .addNode("analyze", analyzeNode)
    .addNode("generate", generateNode)
    .addNode("review", reviewNode)
    .addEdge("__start__", "analyze")
    .addConditionalEdges("analyze", shouldContinueFromAnalyze, {
      continue: "generate",
      end: END,
    })
    .addConditionalEdges("generate", shouldContinueFromGenerate, {
      continue: "review",
      end: END,
    })
    .addEdge("review", END)
    .compile()

  return graph
}
