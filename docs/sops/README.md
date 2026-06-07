# SOP Tooling

This folder is for developer-only SOP generation support. It helps a future Cursor or Codex agent create calm, visual, baker-friendly instructions for Kori.

This is not a customer feature. Do not add a public SOP generator UI.

## What This Is For

Use this tooling to create workflow-based SOPs, such as:

- How to update this week's menu
- How to pause ordering if Kori is overwhelmed
- How to review paid orders
- How to get through pickup day
- How to manage delivery orders
- How to send customer updates

Write SOPs around jobs Kori needs to do. Do not write route or feature reference docs.

## Audience

The audience is Kori, the bakery owner. She is non-technical.

Use:

- calm, clear, practical language
- short sentences
- screenshots whenever possible
- plain explanations of why each step matters
- a clear success check
- a simple fallback if she is unsure

Avoid baker-facing mentions of APIs, cache, Redis, webhooks, selectors, environment variables, implementation details, or private data.

## SOP Registry

Structured SOP metadata lives in:

- `/sop/audience.ts`
- `/sop/types.ts`
- `/sop/registry.ts`
- `/sop/workflows/`

The first workflow is:

- `/sop/workflows/update-weekly-menu.ts`

## Example SOP Outputs

The first generated baker-facing SOP package lives in:

- `/docs/sops/baker/README.md`
- `/docs/sops/baker/welcome-guide.md`
- `/docs/sops/baker/weekly-checklist.md`
- `/docs/sops/baker/bake-day-checklist.md`
- `/docs/sops/baker/emergency-guide.md`
- `/docs/sops/baker/training-plan.md`
- `/docs/sops/baker/update-weekly-menu.md`
- `/docs/sops/baker/open-close-ordering.md`
- `/docs/sops/baker/review-paid-orders.md`
- `/docs/sops/baker/pickup-orders.md`
- `/docs/sops/baker/delivery-orders.md`
- `/docs/sops/baker/customer-updates.md`

Most files also have a printable `.html` version beside the Markdown file.

These are intended to be useful first drafts for Kori, not just examples. Keep them truthful to the current app.

If the image files are missing, run the screenshot capture command below from a local machine with Node and the package manager available.

## Screenshot Capture

Use the local screenshot capture command to create images for an existing workflow:

```bash
ENABLE_SOP_TOOLS=true pnpm sop:capture update-weekly-menu
```

The script uses:

- `LOCAL_APP_URL` when set
- otherwise `PLAYWRIGHT_BASE_URL` when set
- otherwise `http://localhost:3000`

The capture command may start the local dev server if one is not already running. Admin screenshots require `ADMIN_PASSWORD` in `.env.local` or the shell environment.

Screenshots are saved to:

```text
docs/sops/baker/images/update-weekly-menu/
```

The script also writes:

```text
docs/sops/baker/images/update-weekly-menu/manifest.json
```

The manifest lists captured files, missing `data-sop` handles, and skipped steps. It must not include secrets or customer data.

Safety rules:

- Run this locally only.
- Do not target production.
- Do not use real customer data in screenshots.
- Keep baker-facing SOP files plain and non-technical.
- The script refuses `NODE_ENV=production`.
- The script requires `ENABLE_SOP_TOOLS=true`.
- Non-local URLs are rejected unless `ALLOW_NON_LOCAL_SOP_CAPTURE=true` is set intentionally for a safe non-production target.

When adding screenshots for a new workflow:

1. Add `screenshotName` values to that workflow.
2. Add or reuse stable `data-sop` handles.
3. Prefer `highlightDataSop` for the exact item to highlight.
4. Run `pnpm sop:capture workflow-slug`.
5. Confirm the Markdown and HTML files reference the saved filenames.

Current workflow screenshot folders:

- `/docs/sops/baker/images/update-weekly-menu/`
- `/docs/sops/baker/images/open-close-ordering/`
- `/docs/sops/baker/images/review-paid-orders/`
- `/docs/sops/baker/images/pickup-orders/`
- `/docs/sops/baker/images/delivery-orders/`
- `/docs/sops/baker/images/customer-updates/`

If screenshots cannot be captured in the current environment, keep the image references in baker-facing files and capture the images later. Do not add developer caveats to Kori's SOPs.

## Screenshot Review Checklist

Before using screenshots in the baker-facing docs, check:

- No real customer data is visible.
- The target button or area is visible.
- The screenshot matches the SOP step.
- Text is readable.
- No developer overlays or private local debug information are visible.
- The public page screenshot looks like what a customer would see.
- The highlight is clear, but not distracting.

If local menu or order data is empty, use safe test data before capture. Do not use real customer orders in screenshots.

Known data-dependent screenshot gaps:

- `delivery-orders` needs at least one active paid delivery order with an address to show the **Mark delivered** button. Without that safe test data, the capture falls back to the empty delivery state for that step.
- `customer-updates` is clearest when local data includes at least one paid order with a customer email, so the composer can show the update choices after an order is selected.

## Dev-Only Context Endpoint

Run the local app in development and set:

```text
ENABLE_SOP_TOOLS=true
```

Then open:

```text
/api/dev/sop/context
```

The endpoint returns the SOP registry as JSON. It only works when:

- `NODE_ENV === "development"`
- `ENABLE_SOP_TOOLS === "true"`

It returns `404` otherwise. Do not expose this in production.

## Output Convention

Generated SOP files should go here:

- Markdown SOPs: `/docs/sops/baker/`
- HTML SOPs: `/docs/sops/baker/`
- Screenshots: `/docs/sops/baker/images/{workflowSlug}/`
- Templates: `/docs/sops/templates/`

Do not use real customer information in screenshots. Use local or scrubbed data.

## Using `data-sop`

The app includes stable `data-sop` attributes for SOP screenshots and navigation. Future agents should use them to:

- find the correct button or section
- highlight the relevant UI in screenshots
- avoid brittle text or CSS selectors
- identify repeated menu items with `data-sop-item-slug`

Example:

```text
[data-sop="menu-item-edit"]
[data-sop="menu-item-card"][data-sop-item-slug="brown-butter-blondie"]
```

Do not mention selectors in baker-facing SOPs.

## Adding A New Workflow

1. Create a file in `/sop/workflows/`.
2. Use the `SopWorkflow` type.
3. Write owner instructions in plain language.
4. Reference real routes from `/sop/registry.ts`.
5. Reference stable `data-sop` handles when possible.
6. Include screenshots names for every visual step.
7. Add the workflow to `sopRegistry.workflows`.
8. Add new `data-sop` attributes only where useful.

After adding the workflow, create or update the matching baker-facing Markdown and HTML files in `/docs/sops/baker/`.

Keep generated docs workflow-based. Good titles are "How to manage pickup orders" or "How to open or close ordering." Avoid page reference titles.

## Writing Rules

- Write for Kori, not a developer.
- Use short sentences.
- Prefer "Click", "Open", "Check", and "Save".
- Explain what the step controls.
- Say what success looks like.
- Include what to do if unsure.
- Keep the tone calm and supportive.
- Do not say she can do something the app cannot do.

## What Not To Do

- Do not expose SOP tooling in production.
- Do not add a public SOP generator page.
- Do not include secrets.
- Do not include real customer data.
- Do not use real order details in screenshots.
- Do not document implementation details in baker-facing SOPs.
- Do not change app behavior just to support SOP generation.
