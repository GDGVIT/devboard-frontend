import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Function to clean markdown content
export function cleanMarkdownContent(content: string): string {
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

// Function to create analysis prompt
export function createAnalysisPrompt(state: any): string {
  const { username, isNew, currentContent, personalInfo } = state

  if (isNew) {
    return `Analyze the username "${username}" and create a professional analysis for a GitHub README.

Personal Information:
- Field: ${personalInfo?.field || "Not specified"}
- Experience: ${personalInfo?.experience || "Not specified"}  
- Skills: ${personalInfo?.skills || "Not specified"}
- Interests: ${personalInfo?.interests || "Not specified"}
- Goals: ${personalInfo?.goals || "Not specified"}

Consider what kind of developer they are and suggest appropriate sections.
Return a brief analysis of what should be included in their README.`
  } else {
    return `Analyze this existing README content and suggest improvements:

${currentContent}

Personal Information for enhancement:
- Field: ${personalInfo?.field || "Not specified"}
- Experience: ${personalInfo?.experience || "Not specified"}
- Skills: ${personalInfo?.skills || "Not specified"}
- Interests: ${personalInfo?.interests || "Not specified"}
- Goals: ${personalInfo?.goals || "Not specified"}

Provide analysis on what's good, what's missing, and what could be improved.`
  }
}

// Function to create generation prompt
export function createGenerationPrompt(state: any): string {
  const { username, isNew, currentContent, personalInfo, analysis } = state

  if (isNew) {
    return `Based on this analysis: ${analysis}

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
![${username}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical)

## 💡 Daily Quote
![Quote](https://quotes-github-readme.vercel.app/api?type=horizontal&theme=radical)

## 👀 Profile Views
![Profile Views](https://komarev.com/ghpvc/?username=${username}&color=blueviolet)

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
  } else {
    return `Based on this analysis: ${analysis}
               
Improve this existing README content:
${currentContent}

Add missing sections like GitHub stats, profile views, and daily quotes.
Ensure proper markdown formatting with clean spacing and structure.

CRITICAL: Return ONLY the raw markdown content without any code block wrappers.
DO NOT include \`\`\`markdown or \`\`\` in your response.
Return ONLY the improved markdown content.`
  }
}

// Function to create review prompt
export function createReviewPrompt(state: any): string {
  return `Review and refine this generated README content:

${state.generatedContent}

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
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
