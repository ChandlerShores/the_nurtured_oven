import { NextResponse } from "next/server"
import { sopRegistry, sopWorkflowSummaries } from "@/sop/registry"

export async function GET() {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.ENABLE_SOP_TOOLS !== "true"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    appName: sopRegistry.appName,
    audience: sopRegistry.audience,
    routes: sopRegistry.routes,
    selectors: sopRegistry.selectors,
    workflowSummaries: sopWorkflowSummaries,
    workflows: sopRegistry.workflows,
    outputConventions: sopRegistry.outputConventions,
  })
}
