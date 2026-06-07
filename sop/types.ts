export type SopRiskLevel = "low" | "medium" | "high"

export type SopTrainingFormat =
  | "self-serve"
  | "guided walkthrough"
  | "live training"

export type SopScreenshotCaptureMode =
  | "page"
  | "viewport"
  | "element"
  | "element-with-context"

export interface SopAudience {
  name: string
  role: string
  technicalComfort: string
  tone: string[]
  readingLevel: string
  documentationGoals: string[]
  preferWordsAndPhrases: string[]
  avoidWordsAndPhrases: string[]
}

export interface SopRouteMap {
  [key: string]: {
    label: string
    path: string
    purpose: string
  }
}

export interface SopSelector {
  dataSop: string
  description: string
  route?: string
  repeated?: boolean
}

export interface SopWorkflowStep {
  id: string
  title: string
  ownerInstruction: string
  route: string
  dataSop?: string
  dataSopItemSlug?: string
  highlightDataSop?: string
  captureMode?: SopScreenshotCaptureMode
  screenshotName?: string
  notesForAgent?: string
  expectedResult: string
}

export interface SopWorkflow {
  slug: string
  title: string
  ownerFacingTitle: string
  purpose: string
  whenToUse: string[]
  prerequisites: string[]
  steps: SopWorkflowStep[]
  successCheck: string[]
  commonMistakes: string[]
  troubleshooting: string[]
  relatedWorkflows: string[]
  riskLevel: SopRiskLevel
  recommendedTrainingFormat: SopTrainingFormat
}

export interface SopRegistry {
  appName: string
  audience: SopAudience
  routes: SopRouteMap
  selectors: SopSelector[]
  outputConventions: {
    markdownSops: string
    htmlSops: string
    screenshots: string
    templates: string
  }
  workflows: SopWorkflow[]
}
