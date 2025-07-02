import { z } from "zod"

// Input schema
export const ReadmeInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  currentContent: z.string().optional(),
  isNew: z.boolean(),
  personalInfo: z
    .object({
      field: z.string().optional(),
      experience: z.string().optional(),
      skills: z.string().optional(),
      interests: z.string().optional(),
      goals: z.string().optional(),
    })
    .optional(),
})

export type ReadmeInput = z.infer<typeof ReadmeInputSchema>

// State interface for the graph
export interface ReadmeState {
  username: string
  currentContent?: string
  isNew: boolean
  personalInfo?: {
    field?: string
    experience?: string
    skills?: string
    interests?: string
    goals?: string
  }
  analysis?: string
  generatedContent?: string
  finalContent?: string
  error?: string
}
