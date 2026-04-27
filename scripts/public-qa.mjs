const baseUrl = (process.env.QA_BASE_URL ?? "https://dmm-seli.pages.dev").replace(/\/$/, "")
const affiliatePattern = /[?&]af_id=[^&]*-99\d(?:&|$)/
const timeoutMs = 10000

function fail(message) {
  throw new Error(message)
}

async function get(url, accept = "application/json") {
  const response = await fetch(url, {
    headers: { accept },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    fail(`${url} returned ${response.status}`)
  }
  return response
}

async function getJson(path) {
  const response = await get(`${baseUrl}${path}`)
  return response.json()
}

async function getText(path) {
  const response = await get(`${baseUrl}${path}`, "text/html")
  return response.text()
}

function assertWork(work, context) {
  if (!work || typeof work !== "object") fail(`${context}: work missing`)
  if (typeof work.workId !== "string" || !work.workId) fail(`${context}: workId missing`)
  if (typeof work.title !== "string" || !work.title) fail(`${context}: title missing`)
  if (typeof work.affiliateUrl !== "string" || !affiliatePattern.test(work.affiliateUrl)) {
    fail(`${context}: affiliateUrl missing expected af_id suffix`)
  }
}

const homeHtml = await getText("/")
if (!homeHtml.includes('<div id="root"></div>')) fail("home html root missing")

const worksHtml = await getText("/works")
if (!worksHtml.includes('<div id="root"></div>')) fail("works html root missing")

const healthz = await getJson("/api/healthz")
if (healthz?.ok !== true || healthz?.db !== "ok") fail(`healthz invalid: ${JSON.stringify(healthz)}`)

const floors = await getJson("/api/floors")
if (!floors || typeof floors !== "object") fail("floors payload missing")
if (!floors.counts || typeof floors.counts !== "object") fail("floors counts missing")
if (!Array.isArray(floors.featured)) fail("floors featured must be array")

const products = await getJson("/api/products?limit=12")
if (!Array.isArray(products)) fail("products must be array")
if (!products.length) fail("products empty")
products.slice(0, 3).forEach((work, index) => assertWork(work, `products[${index}]`))

const first = products[0]
const detail = await getJson(`/api/products/${encodeURIComponent(first.workId)}`)
assertWork(detail, "detail")
if (!Array.isArray(detail.history)) fail("detail history must be array")
if (detail.latestPrice == null) fail("detail latestPrice missing")
if (!detail.updatedAt) fail("detail updatedAt missing")

const detailHtml = await getText(`/works/${encodeURIComponent(first.workId)}`)
if (!detailHtml.includes('<div id="root"></div>')) fail("detail html root missing")

console.log(
  JSON.stringify({
    status: "ok",
    baseUrl,
    checkedWorkId: first.workId,
    products: products.length,
    updatedAt: floors.updatedAt,
  }),
)
