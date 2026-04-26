import fs from "node:fs"

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim()
const projectName = (process.env.CLOUDFLARE_PAGES_PROJECT ?? "dmm-seli").trim()
const summaryPath = process.env.GITHUB_STEP_SUMMARY

function appendSummary(lines) {
  if (!summaryPath) return
  fs.appendFileSync(summaryPath, `${lines.join("\n")}\n`, "utf8")
}

function fail(message, extra = []) {
  console.error(message)
  if (extra.length) {
    for (const line of extra) {
      console.error(line)
    }
  }
  appendSummary(["## Cloudflare Pages auth preflight", "", `- status: fail`, `- message: ${message}`, ...extra.map((line) => `- ${line}`)])
  process.exitCode = 1
}

if (!accountId || !apiToken) {
  fail("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing")
} else {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  })

  const payload = await response.json().catch(() => ({}))
  const firstError = Array.isArray(payload?.errors) ? payload.errors[0] : null

  if (!response.ok || payload?.success === false) {
    const message = firstError?.message ?? `Cloudflare API returned ${response.status}`
    const code = firstError?.code ?? "unknown"
    const extra = [
      `project: ${projectName}`,
      `api: /accounts/.../pages/projects/${projectName}`,
      `code: ${code}`,
    ]

    if (Number(code) === 10000) {
      extra.push("hint: token must include `Account > Cloudflare Pages > Edit` for the target account")
    }

    fail(message, extra)
  } else {
    console.log(JSON.stringify({ project: projectName, id: payload?.result?.id ?? null, subdomain: payload?.result?.subdomain ?? null }))
    appendSummary([
      "## Cloudflare Pages auth preflight",
      "",
      "- status: ok",
      `- project: ${projectName}`,
      `- subdomain: ${payload?.result?.subdomain ?? "unknown"}`,
    ])
  }
}
