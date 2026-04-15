export const FLOOR_ORDER = ["comic", "novel", "otherbooks", "photo"] as const

export type Floor = (typeof FLOOR_ORDER)[number]
export type SortSource = "rank" | "date"
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
  currentPrice: number | null
  listPrice: number | null
  pointRate: number | null
  effectivePrice: number | null
  discountPct: number | null
  isOnSale: boolean
  sortSource: SortSource[]
  rankOrder: number | null
  dateOrder: number | null
  releaseDate: string | null
  fetchedAt: string
}

export type WorksIndexPayload = {
  updatedAt: string
  works: CatalogWork[]
}

export type TopPayload = {
  updatedAt: string
  featuredSales: CatalogWork[]
  popular: CatalogWork[]
  newReleases: CatalogWork[]
  floorCounts: Record<Floor, number>
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
