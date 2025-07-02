export interface WidgetElement {
  id: string
  type: "text" | "image" | "chart" | "stats" | "social" | "badge" | "progress" | "container"
  position: { x: number; y: number }
  size: { width: number; height: number }
  style: {
    backgroundColor?: string
    color?: string
    fontSize?: number
    fontWeight?: string
    borderRadius?: number
    border?: string
    padding?: number
    margin?: number
    textAlign?: "left" | "center" | "right"
    opacity?: number
    boxShadow?: string
  }
  content: {
    text?: string
    imageUrl?: string
    chartType?: "bar" | "line" | "pie" | "doughnut"
    chartData?: any
    socialPlatform?: "github" | "twitter" | "linkedin"
    badgeType?: "shield" | "flat" | "plastic"
    progressValue?: number
    progressMax?: number
  }
  animation?: {
    type: "fade" | "slide" | "bounce" | "pulse"
    duration: number
    delay: number
  }
  responsive?: {
    mobile: Partial<WidgetElement>
    tablet: Partial<WidgetElement>
  }
}

export interface Widget {
  id: string
  name: string
  description: string
  category: string
  elements: WidgetElement[]
  canvas: {
    width: number
    height: number
    backgroundColor: string
  }
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    tags: string[]
    author: string
    downloads: number
    rating: number
  }
  settings: {
    isPublic: boolean
    allowCustomization: boolean
    requiresAuth: boolean
    apiEndpoint?: string
  }
}

export interface WidgetTemplate {
  id: string
  name: string
  description: string
  category: string
  preview: string
  elements: Omit<WidgetElement, "id">[]
  popularity: number
}
