# SOP Generation Placeholder

This folder is a stub for future SOP automation.

The intended future command shape is:

```bash
npm run sop:generate -- update-weekly-menu
```

Screenshots can be captured today with:

```bash
ENABLE_SOP_TOOLS=true pnpm sop:capture update-weekly-menu
```

or:

```bash
npm run sop:agent -- "Create a visual SOP for updating the weekly menu"
```

A future agent should:

1. Start the app locally in development.
2. Enable the dev-only SOP context endpoint with `ENABLE_SOP_TOOLS=true`.
3. Read `/api/dev/sop/context`.
4. Open the workflow route sequence.
5. Use `data-sop` attributes for stable navigation and screenshot highlighting.
6. Save screenshots under `/docs/sops/baker/images/{workflowSlug}/`.
7. Draft Markdown or HTML SOPs under `/docs/sops/baker/`.

Do not add heavy automation until the SOP shape is proven useful.
