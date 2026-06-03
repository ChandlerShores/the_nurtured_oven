import { readFileSync } from "fs"

/** Load `.env.local` into `process.env` without overwriting existing keys. */
export function loadEnvLocal(path = ".env.local"): void {
  try {
    const raw = readFileSync(path, "utf8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const i = trimmed.indexOf("=")
      if (i < 0) continue
      const key = trimmed.slice(0, i).trim()
      let value = trimmed.slice(i + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.warn(`No ${path} found; using existing process.env`)
  }
}
