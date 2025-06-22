import { StateGraph, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Define the state interface
interface PortfolioState {
  content: string;
  customMessage: string;
  style: string;
  parsedData: string;
  portfolioCode: string;
  currentStep: string;
  progress: number;
  error: string | null;
}

// Initialize the LLM
// Note: Ensure your GEMINI_API_KEY is available in the environment variables
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro-latest",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// Node functions
async function parseContentNode(state: PortfolioState): Promise<Partial<PortfolioState>> {
  try {
    console.log("---PARSING CONTENT---");
    const systemPrompt = `You are an expert developer analyzing content for portfolio generation.
Extract key information from the provided content and structure it for portfolio creation.

Focus on:
- Personal information (name, title, bio)
- Skills and technologies
- Projects and achievements
- Experience and education
- Contact information

Return the analysis in a structured JSON format.`;

    const prompt = `Analyze this content for portfolio generation:

${state.content}

Additional requirements: ${state.customMessage}

Extract and structure the key information that would be relevant for a ${state.style} style React portfolio website.`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt),
    ]);

    return {
      parsedData: response.content as string,
      currentStep: "generating",
      progress: 50,
      error: null,
    };
  } catch (error) {
    console.error("Error in parseContentNode:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to parse content",
      currentStep: "error",
    };
  }
}

async function generateCodeNode(state: PortfolioState): Promise<Partial<PortfolioState>> {
  try {
    console.log("---GENERATING CODE---");
    const systemPrompt = `You are an expert React developer creating portfolio websites.
Generate a complete, modern React portfolio website based on the analyzed content.

Requirements:
- Use modern React with hooks (functional components).
- Include responsive design with Tailwind CSS.
- Create a single-page application.
- Use clean, professional code structure.
- Include proper TypeScript types.
- Make it visually appealing and ${state.style} in style.
- The final output MUST be a single file containing the complete, runnable React component. Do not include any explanations, just the code.

Return ONLY the complete React component code, nothing else.`;

    const prompt = `Create a React portfolio website based on this analyzed data:

${state.parsedData}

Style: ${state.style}
Additional requirements: ${state.customMessage}

Generate a complete, production-ready React component that showcases this person's portfolio.
Include sections for: Hero, About, Skills, Projects, Experience, and Contact.
Use Tailwind CSS for styling and make it responsive and modern.`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt),
    ]);

    return {
      portfolioCode: response.content as string,
      currentStep: "complete",
      progress: 100,
      error: null,
    };
  } catch (error) {
    console.error("Error in generateCodeNode:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to generate code",
      currentStep: "error",
    };
  }
}

// This function decides whether to continue to code generation or stop due to an error.
const should_continue = (state: PortfolioState): "generate_code" | "end" => {
  if (state.error) {
    return "end";
  }
  return "generate_code";
};

// Create the workflow graph
const workflow = new StateGraph<PortfolioState>({
  channels: {
    content: {
      value: (x: string, y: string) => y,
      default: () => "",
    },
    customMessage: {
      value: (x: string, y: string) => y,
      default: () => "",
    },
    style: {
      value: (x: string, y: string) => y,
      default: () => "",
    },
    parsedData: {
      value: (x: string, y: string) => y,
      default: () => "",
    },
    portfolioCode: {
      value: (x: string, y: string) => y,
      default: () => "",
    },
    currentStep: {
      value: (x: string, y: string) => y,
      default: () => "initial",
    },
    progress: {
      value: (x: number, y: number) => y,
      default: () => 0,
    },
    error: {
      value: (x: string | null, y: string | null) => y,
      default: () => null,
    },
  },
});

// Add nodes to the graph
workflow.addNode("parse_content", parseContentNode);
workflow.addNode("generate_code", generateCodeNode);

// Set the entry point for the workflow
workflow.setEntryPoint("parse_content");

// Define the conditional edge. After parsing, check if we should continue.
workflow.addConditionalEdges("parse_content", should_continue, {
  generate_code: "generate_code", // If should_continue returns "generate_code", move to the generate_code node
  end: END,                     // If should_continue returns "end", finish the graph execution.
});

// After generating code, the graph always finishes.
workflow.addEdge("generate_code", END);

// Compile the graph into a runnable app
export const portfolioGraph = workflow.compile();
