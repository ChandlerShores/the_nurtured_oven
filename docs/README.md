# Project Documentation

This folder contains current, maintained documentation for The Nurtured Oven. Historical implementation logs and old reviews live in `archive/` and should not be treated as current guidance.

| File | Audience | Purpose |
|---|---|---|
| [ENV.md](./ENV.md) | Developer, deployment maintainer | Environment variables, required/optional settings, Sheets tab ranges |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment maintainer | Vercel tier setup, preflight checks, promotion checklist |
| [ADMIN_SOP.md](./ADMIN_SOP.md) | Baker, owner/operator | Weekly admin workflow and portal procedures |
| [PAYMENTS.md](./PAYMENTS.md) | Developer, operator | Square checkout, webhook handling, Sheets writes, paid-order recovery |
| [SECURITY.md](./SECURITY.md) | Developer, security maintainer | Auth model, rate limits, webhook verification, production risks |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | Frontend maintainer | Manual accessibility checks and contrast conventions |
| [assets/README.md](./assets/README.md) | Builder | Non-served reference assets |
| [archive/](./archive/) | Maintainer | Historical notes only |

Keep this folder small. If a document is only an implementation summary, old audit, temporary launch note, or generated review, archive it or delete it after salvaging durable facts into the canonical docs above.
