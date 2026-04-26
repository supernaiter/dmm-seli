import fs from "node:fs"

const deploymentUrl = process.env.DEPLOYMENT_URL?.trim()
const aliasUrl = process.env.ALIAS_URL?.trim() ?? ""
const summaryPath = process.env.GITHUB_STEP_SUMMARY
const retryCount = 5
const retryDelayMs = 2000
const requestTimeoutMs = 10000

function appendSummary(lines) {
  if (!summaryPath) return
  fs.appendFileSync(summaryPath, `${lines.join("\n")}\n`, "utf8")
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fail(message) {
  console.error(message)
  appendSummary([
    "## Cloudflare Pages deploy verify",
    "",
    "- status: fail",
    `- message: ${message}`,
    ...(deploymentUrl ? [`- deployment_url: ${deploymentUrl}`] : []),
    ...(aliasUrl ? [`- alias_url: ${aliasUrl}`] : []),
    `- request_timeout_ms: ${requestTimeoutMs}`,
    `- retry_count: ${retryCount}`,
  ])
  process.exitCode = 1
}

async function fetchWithRetry(url, init = {}) {
  let lastError = null

  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        redirect: "follow",
        signal: AbortSignal.timeout(requestTimeoutMs),
      })

      if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error
      if (attempt < retryCount) {
        await sleep(retryDelayMs)
      }
    }
  }

  throw lastError
}

if (!deploymentUrl) {
  fail("DEPLOYMENT_URL is missing")
} else {
  const apiHealthzUrl = `${deploymentUrl.replace(/\/$/, "")}/api/healthz`

  try {
    await fetchWithRetry(deploymentUrl)
    if (aliasUrl) {
      await fetchWithRetry(aliasUrl)
    }

    const apiResponse = await fetchWithRetry(apiHealthzUrl, {
      headers: { accept: "application/json" },
    })
    const body = await apiResponse.json().catch(() => null)
    if (!body || body.ok !== true || body.db !== "ok") {
      throw new Error(`api_healthz body invalid: ${JSON.stringify(body)}`)
    }

    appendSummary([
      "## Cloudflare Pages deploy verify",
      "",
      "- status: ok",
      `- deployment_url: ${deploymentUrl}`,
      `- api_healthz_url: ${apiHealthzUrl}`,
      `- api_healthz_json: ${JSON.stringify(body)}`,
      `- request_timeout_ms: ${requestTimeoutMs}`,
      `- retry_count: ${retryCount}`,
      ...(aliasUrl ? [`- alias_url: ${aliasUrl}`, `- alias_url_checked: true`] : []),
    ])
  } catch (error) {
    fail(error instanceof Error ? error.message : "deployment verify failed")
  }
}
