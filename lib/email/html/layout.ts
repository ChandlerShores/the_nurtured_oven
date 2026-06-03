import { siteConfig } from "@/lib/content/site"
import { emailTheme } from "@/lib/email/html/theme"
import { isAllowedHttpsExternalUrl } from "@/lib/security/safe-external-url"

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function emailLayout(options: {
  preheader?: string
  title: string
  badge?: { label: string; tone: "pickup" | "delivery" | "neutral" | "gift" }
  bodyHtml: string
  footerHtml?: string
  variant?: "customer" | "owner"
}): string {
  const t = emailTheme
  const badgeColors = {
    pickup: { bg: t.oatmeal, text: t.espresso },
    delivery: { bg: "#E8DDD4", text: t.espresso },
    neutral: { bg: t.linen, text: t.olive },
    gift: { bg: "#F0E4E3", text: t.espresso },
  }
  const badge = options.badge
    ? badgeColors[options.badge.tone]
    : null

  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>`
    : ""

  const badgeHtml = badge
    ? `<span style="display:inline-block;margin-top:12px;padding:6px 14px;border-radius:999px;background:${badge.bg};color:${badge.text};font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(options.badge!.label)}</span>`
    : ""

  const footer =
    options.footerHtml ??
    `<p style="margin:0;font-size:13px;line-height:1.6;color:${t.olive};">With care,<br><strong style="color:${t.espresso};">${escapeHtml(siteConfig.brandName)}</strong></p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${t.cream};font-family:Georgia,'Times New Roman',serif;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${t.white};border:1px solid ${t.oatmeal};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(74,53,44,0.08);">
          <tr>
            <td style="padding:28px 32px 20px;background:linear-gradient(180deg, ${t.linen} 0%, ${t.white} 100%);border-bottom:1px solid ${t.oatmeal};">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${t.olive};font-family:Helvetica,Arial,sans-serif;">${escapeHtml(siteConfig.brandName)}</p>
              <h1 style="margin:0;font-size:26px;font-weight:400;line-height:1.25;color:${t.espresso};">${escapeHtml(options.title)}</h1>
              ${badgeHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:16px;line-height:1.65;color:${t.espresso};font-family:Helvetica,Arial,sans-serif;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background:${t.linen};border-top:1px solid ${t.oatmeal};">
              ${footer}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:${t.olive};font-family:Helvetica,Arial,sans-serif;">${escapeHtml(siteConfig.brandName)} · Kentucky cottage bakery</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function htmlSection(title: string, innerHtml: string): string {
  const t = emailTheme
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="padding-bottom:8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${t.olive};">${escapeHtml(title)}</td>
      </tr>
      <tr>
        <td style="padding:16px;background:${t.cream};border-radius:12px;border:1px solid ${t.oatmeal};">
          ${innerHtml}
        </td>
      </tr>
    </table>`
}

export function htmlKeyValue(label: string, value: string): string {
  return `<p style="margin:0 0 10px;font-size:15px;line-height:1.5;"><span style="color:${emailTheme.olive};">${escapeHtml(label)}</span><br><strong style="color:${emailTheme.espresso};">${escapeHtml(value)}</strong></p>`
}

export function htmlParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${emailTheme.espresso};">${escapeHtml(text)}</p>`
}

export function htmlNote(text: string): string {
  return `<p style="margin:16px 0 0;padding:14px 16px;background:${emailTheme.linen};border-left:3px solid ${emailTheme.blush};border-radius:0 8px 8px 0;font-size:14px;line-height:1.55;color:${emailTheme.espresso};">${escapeHtml(text)}</p>`
}

export function htmlButton(href: string, label: string): string {
  if (!isAllowedHttpsExternalUrl(href)) return ""
  const t = emailTheme
  const url = escapeHtml(href)
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;">
    <tr>
      <td style="border-radius:10px;background:${t.espresso};">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:${t.cream};text-decoration:none;font-family:Helvetica,Arial,sans-serif;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`
}

export function htmlLineItems(
  items: { name: string; quantity: number; extra?: string }[]
): string {
  if (items.length === 0) {
    return `<p style="margin:0;font-size:15px;color:${emailTheme.olive};">See your receipt for details.</p>`
  }
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 0;border-bottom:1px solid ${emailTheme.oatmeal};font-size:15px;color:${emailTheme.espresso};">${escapeHtml(item.name)}</td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid ${emailTheme.oatmeal};font-size:15px;color:${emailTheme.olive};white-space:nowrap;">× ${item.quantity}</td>
        </tr>`
    )
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
}

export function htmlTotal(label: string, amount: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
    <tr>
      <td style="padding-top:12px;font-size:17px;font-weight:700;color:${emailTheme.espresso};">${escapeHtml(label)}</td>
      <td align="right" style="padding-top:12px;font-size:17px;font-weight:700;color:${emailTheme.espresso};">${escapeHtml(amount)}</td>
    </tr>
  </table>`
}
