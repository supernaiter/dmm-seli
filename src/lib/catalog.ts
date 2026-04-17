export const FLOOR_ORDER = ["comic", "novel", "otherbooks", "photo"] as const

export type Floor = (typeof FLOOR_ORDER)[number]
export type SortSource = "rank" | "date"
export type SortMode = "rank" | "date" | "price_asc" | "price_desc" | "discount"
export type ViewDensity = "dense" | "wide"

export type CatalogWork = {
  workId: string
  contentId: string
  productId: string | null
  title: string
  floor: Floor
  authors: string[]
  series: string | null
  maker: string | null
  isbn: string | null
  imageUrl: string | null
  affiliateUrl: string | null
  tachiyomiUrl: string | null
  latestPrice: number | null
  listPrice: number | null
  pointRate: number | null
  effectivePrice: number | null
  discountPct: number | null
  isOnSale: boolean
  badge: string | null
  pastLowest: number | null
  rankOrder: number | null
  dateOrder: number | null
  lastCapturedAt: string | null
}

export type PriceHistoryPoint = {
  capturedAt: string
  dateLabel: string
  price: number
  listPrice: number | null
  pointRate: number | null
  effectivePrice: number | null
}

export type WorkDetail = CatalogWork & {
  releaseDate: string | null
  bandMin: number | null
  bandMax: number | null
  mode: number | null
  history: PriceHistoryPoint[]
  updatedAt: string
}

export type FloorsPayload = {
  updatedAt: string
  counts: Record<Floor, number>
  featured: CatalogWork[]
}

export const FLOOR_LABELS: Record<Floor, string> = {
  comic: "コミック",
  novel: "文芸・ラノベ",
  otherbooks: "ビジネス・実用",
  photo: "写真集",
}

export const SORT_LABELS: Record<SortSource, string> = {
  rank: "人気",
  date: "新着",
}

export const SORT_MODE_LABELS: Record<SortMode, string> = {
  rank: "人気順",
  date: "新着順",
  price_asc: "安い順",
  price_desc: "高い順",
  discount: "割引率順",
}

export function sortCatalogWorks(works: CatalogWork[], sort: SortMode) {
  return [...works].sort((left, right) => {
    if (sort === "rank") {
      return (left.rankOrder ?? Number.MAX_SAFE_INTEGER) - (right.rankOrder ?? Number.MAX_SAFE_INTEGER)
    }
    if (sort === "date") {
      return (left.dateOrder ?? Number.MAX_SAFE_INTEGER) - (right.dateOrder ?? Number.MAX_SAFE_INTEGER)
    }
    if (sort === "price_asc") {
      return (left.latestPrice ?? Number.MAX_SAFE_INTEGER) - (right.latestPrice ?? Number.MAX_SAFE_INTEGER)
    }
    if (sort === "price_desc") {
      return (right.latestPrice ?? -1) - (left.latestPrice ?? -1)
    }

    const discountDelta = (right.discountPct ?? -1) - (left.discountPct ?? -1)
    if (discountDelta !== 0) return discountDelta
    return (right.pointRate ?? -1) - (left.pointRate ?? -1)
  })
}
