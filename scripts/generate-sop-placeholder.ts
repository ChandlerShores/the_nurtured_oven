import { sopRegistry } from "../sop/registry"

const workflowSlug = process.argv[2]

console.log("SOP generation is a placeholder for now.")
console.log("")
console.log("Available workflows:")
for (const workflow of sopRegistry.workflows) {
  const marker = workflow.slug === workflowSlug ? "*" : "-"
  console.log(`${marker} ${workflow.slug}: ${workflow.ownerFacingTitle}`)
}
console.log("")
console.log("Future output folders:")
console.log(`Markdown/HTML: ${sopRegistry.outputConventions.markdownSops}`)
console.log("Screenshots:", sopRegistry.outputConventions.screenshots)
console.log("")
console.log("Suggested future command:")
console.log("npm run sop:generate -- update-weekly-menu")
