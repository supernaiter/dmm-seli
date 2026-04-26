const baseUrl = (process.env.BASE_URL ?? "http://127.0.0.1:4310").replace(/\/$/, "")

type CatalogWork = {
  workId: string
  imageUrl: string | null
  affiliateUrl: string | null
  tachiyomiUrl: string | null
  lastCapturedAt: string | null
}

type FloorsPayload = {
  updatedAt: string
  featured: CatalogWork[]
}

type WorkDetail = CatalogWork & {
  updatedAt: string
  history: Array<{ capturedAt: string; price: number }>
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { headers: { accept: "application/json" } })
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }
  return (await response.json()) as T
}

function assertNonEmpty(value: string | null | undefined, label: string) {
  if (!value) {
    throw new Error(`${label} is empty`)
  }
}

function assertHttpsUrl(value: string | null | undefined, label: string) {
  if (!value) return

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${label} is not a valid URL: ${value}`)
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} is not https: ${value}`)
  }
}

async function main() {
  const floors = await getJson<FloorsPayload>("/api/floors")
  assertNonEmpty(floors.updatedAt, "floors.updatedAt")

  const works = await getJson<CatalogWork[]>("/api/products?limit=24")
  if (!works.length) {
    throw new Error("products returned empty")
  }

  const sample = works.slice(0, 12)
  for (const work of sample) {
    assertNonEmpty(work.workId, "workId")
    assertNonEmpty(work.lastCapturedAt, `lastCapturedAt:${work.workId}`)
    assertHttpsUrl(work.imageUrl, `imageUrl:${work.workId}`)
    assertHttpsUrl(work.affiliateUrl, `affiliateUrl:${work.workId}`)
    assertHttpsUrl(work.tachiyomiUrl, `tachiyomiUrl:${work.workId}`)
  }

  const detailTarget = sample.find((work) => work.affiliateUrl) ?? sample[0]
  const detail = await getJson<WorkDetail>(`/api/products/${encodeURIComponent(detailTarget.workId)}`)
  assertNonEmpty(detail.updatedAt, `detail.updatedAt:${detail.workId}`)
  assertHttpsUrl(detail.imageUrl, `detail.imageUrl:${detail.workId}`)
  assertHttpsUrl(detail.affiliateUrl, `detail.affiliateUrl:${detail.workId}`)
  assertHttpsUrl(detail.tachiyomiUrl, `detail.tachiyomiUrl:${detail.workId}`)

  if (!Array.isArray(detail.history)) {
    throw new Error(`detail.history is not an array: ${detail.workId}`)
  }

  console.log(
    JSON.stringify({
      baseUrl,
      worksChecked: sample.length,
      detailChecked: detail.workId,
      historyPoints: detail.history.length,
      featuredChecked: floors.featured.length,
    }),
  )
  console.log("intro qa ok")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
