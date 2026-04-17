import type { CatalogWork } from "../src/lib/catalog"
import { createDb, getWorkStates, insertPriceSnapshot, migrateDatabase, upsertTrackedWork } from "../server/db"
import { getRequiredEnv } from "./lib/env"
import { fetchFloorItems, normalizeItem } from "./lib/dmm-client"
import "./lib/env"

type CollectedWork = CatalogWork & { releaseDate: string | null }

function mergeWork(left: CollectedWork, right: CollectedWork): CollectedWork {
  return {
    ...left,
    ...right,
    authors: left.authors.length ? left.authors : right.authors,
    imageUrl: left.imageUrl ?? right.imageUrl,
    affiliateUrl: left.affiliateUrl ?? right.affiliateUrl,
    tachiyomiUrl: left.tachiyomiUrl ?? right.tachiyomiUrl,
    maker: left.maker ?? right.maker,
    series: left.series ?? right.series,
    isbn: left.isbn ?? right.isbn,
    latestPrice: left.latestPrice ?? right.latestPrice,
    listPrice: left.listPrice ?? right.listPrice,
    pointRate: left.pointRate ?? right.pointRate,
    effectivePrice: left.effectivePrice ?? right.effectivePrice,
    discountPct: left.discountPct ?? right.discountPct,
    isOnSale: left.isOnSale || right.isOnSale,
    pastLowest: left.pastLowest ?? right.pastLowest,
    rankOrder: left.rankOrder ?? right.rankOrder,
    dateOrder: left.dateOrder ?? right.dateOrder,
    lastCapturedAt: left.lastCapturedAt ?? right.lastCapturedAt,
    badge: left.badge ?? right.badge,
    releaseDate: left.releaseDate ?? right.releaseDate,
  }
}

function sameValue(left: number | null, right: number | null) {
  return left === right
}

function shouldWriteSnapshot(
  previous: {
    latest_price: number | null
    list_price: number | null
    point_rate: number | null
    last_price_snapshot_at: string | null
  } | undefined,
  current: CatalogWork,
  capturedAt: string,
) {
  if (current.latestPrice == null) {
    return false
  }

  if (!previous) {
    return true
  }

  const changed =
    !sameValue(previous.latest_price, current.latestPrice) ||
    !sameValue(previous.list_price, current.listPrice) ||
    !sameValue(previous.point_rate, current.pointRate)

  if (changed) {
    return true
  }

  if (!previous.last_price_snapshot_at) {
    return true
  }

  const previousAt = new Date(previous.last_price_snapshot_at).getTime()
  const currentAt = new Date(capturedAt).getTime()
  if (Number.isNaN(previousAt) || Number.isNaN(currentAt)) {
    return true
  }

  return currentAt - previousAt >= 24 * 60 * 60 * 1000
}

async function main() {
  getRequiredEnv("DMM_API_ID", ["api_id", "API_ID"])
  getRequiredEnv("DMM_AFFILIATE_ID", ["affiliate_id", "affiliate_ID_header", "AFFILIATE_ID"])
  const sql = createDb(getRequiredEnv("DATABASE_URL"))
  await migrateDatabase(sql)

  const capturedAt = new Date().toISOString()
  const registry = new Map<string, CollectedWork>()

  for (const floor of ["comic", "novel", "otherbooks", "photo"] as const) {
    for (const sort of ["rank", "date"] as const) {
      const items = await fetchFloorItems({ floor, sort, hits: 100 })
      items.forEach((item, index) => {
        const normalized = normalizeItem({
          item,
          floor,
          sort,
          index,
          fetchedAt: capturedAt,
        })
        if (!normalized) return

        const existing = registry.get(normalized.workId)
        registry.set(normalized.workId, existing ? mergeWork(existing, normalized) : normalized)
      })
    }
  }

  const existingStates = new Map((await getWorkStates(sql)).map((row) => [row.work_id, row]))
  let snapshotWrites = 0

  for (const work of registry.values()) {
    await upsertTrackedWork(sql, work, capturedAt)
    if (shouldWriteSnapshot(existingStates.get(work.workId), work, capturedAt)) {
      await insertPriceSnapshot(sql, work, capturedAt)
      snapshotWrites += 1
    }
  }

  console.log(
    JSON.stringify({
      capturedAt,
      works: registry.size,
      snapshotWrites,
    }),
  )

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
