import type { CatalogWork, PriceHistoryPoint, WorkDetail } from "../src/lib/catalog"
import type { SnapshotRow, WorkRow } from "./db"

const TOKYO_DAY = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  timeZone: "Asia/Tokyo",
})

function normalizeFloor(value: string): CatalogWork["floor"] {
  if (value === "comic" || value === "novel" || value === "otherbooks" || value === "photo") {
    return value
  }
  return "otherbooks"
}

export function coerceAuthors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      }
    } catch {
      return [value.trim()]
    }
  }

  return []
}

function sameWithinTolerance(left: number | null, right: number | null, tolerance = 1) {
  if (left == null || right == null) return false
  return Math.abs(left - right) <= tolerance
}

export function computeBadge(
  latestPrice: number | null,
  pastLowest: number | null,
  min180: number | null,
  min30: number | null,
) {
  if (sameWithinTolerance(latestPrice, pastLowest)) return "過去最安"
  if (sameWithinTolerance(latestPrice, min180)) return "180日最安"
  if (sameWithinTolerance(latestPrice, min30)) return "30日最安"
  return null
}

export function toCatalogWork(row: WorkRow): CatalogWork {
  return {
    workId: row.work_id,
    contentId: row.content_id,
    productId: row.product_id,
    title: row.title,
    floor: normalizeFloor(row.floor),
    authors: coerceAuthors(row.authors),
    series: row.series,
    maker: row.maker,
    isbn: row.isbn,
    imageUrl: row.image_url,
    affiliateUrl: row.affiliate_url,
    tachiyomiUrl: row.tachiyomi_url,
    latestPrice: row.latest_price,
    listPrice: row.list_price,
    pointRate: row.point_rate,
    effectivePrice: row.effective_price,
    discountPct: row.discount_pct,
    isOnSale: row.is_on_sale,
    badge: computeBadge(row.latest_price, row.past_lowest, row.min_180, row.min_30),
    pastLowest: row.past_lowest,
    rankOrder: row.rank_order,
    dateOrder: row.date_order,
    lastCapturedAt: row.last_price_snapshot_at,
  }
}

function toDateLabel(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return TOKYO_DAY.format(parsed)
}

export function toHistoryPoints(rows: SnapshotRow[]): PriceHistoryPoint[] {
  return [...rows]
    .reverse()
    .map((row) => ({
      capturedAt: row.captured_at,
      dateLabel: toDateLabel(row.captured_at),
      price: row.current_price,
      listPrice: row.list_price,
      pointRate: row.point_rate,
      effectivePrice: row.effective_price,
    }))
}

export function computeMode(values: number[]) {
  if (!values.length) return null

  const counts = new Map<number, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  let bestValue: number | null = null
  let bestCount = -1
  for (const [value, count] of counts.entries()) {
    if (count > bestCount || (count === bestCount && bestValue != null && value < bestValue)) {
      bestValue = value
      bestCount = count
    }
    if (bestValue == null) {
      bestValue = value
      bestCount = count
    }
  }

  return bestValue
}

export function toWorkDetail(row: WorkRow, recentSnapshots: SnapshotRow[], allPrices: number[]): WorkDetail {
  const base = toCatalogWork(row)
  const latestTen = recentSnapshots.slice(0, 10).map((entry) => entry.current_price)
  const bandMin = latestTen.length ? Math.min(...latestTen) : null
  const bandMax = latestTen.length ? Math.max(...latestTen) : null

  return {
    ...base,
    releaseDate: row.release_date,
    bandMin,
    bandMax,
    mode: computeMode(allPrices),
    history: toHistoryPoints(recentSnapshots),
    updatedAt: row.updated_at,
  }
}
