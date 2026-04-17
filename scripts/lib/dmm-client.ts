import { FLOOR_ORDER, type CatalogWork, type Floor, type SortSource } from "../../src/lib/catalog"
import { getEnv } from "./env"

const API_BASE = "https://api.dmm.com/affiliate/v3/ItemList"

type DmmItem = Record<string, unknown>

function normalizeAffiliateId(rawValue: string) {
  const trimmed = rawValue.endsWith("-") ? rawValue.slice(0, -1) : rawValue
  return /-99\d$/.test(trimmed) ? trimmed : `${trimmed}-990`
}

export function getDmmCredentials() {
  const apiId = getEnv("DMM_API_ID", ["api_id", "API_ID"])
  const affiliateId = getEnv("DMM_AFFILIATE_ID", ["affiliate_id", "affiliate_ID_header", "AFFILIATE_ID"])

  if (!apiId || !affiliateId) {
    throw new Error("DMM credentials are missing")
  }

  return {
    apiId,
    affiliateId: normalizeAffiliateId(affiliateId),
  }
}

export function buildItemListUrl(input: {
  floor: Floor
  sort: SortSource
  hits?: number
  offset?: number
}) {
  const { apiId, affiliateId } = getDmmCredentials()
  const url = new URL(API_BASE)
  url.searchParams.set("api_id", apiId)
  url.searchParams.set("affiliate_id", affiliateId)
  url.searchParams.set("output", "json")
  url.searchParams.set("site", "DMM.com")
  url.searchParams.set("service", "ebook")
  url.searchParams.set("floor", input.floor)
  url.searchParams.set("sort", input.sort)
  url.searchParams.set("hits", String(Math.min(Math.max(input.hits ?? 100, 1), 100)))
  if (input.offset && input.offset > 0) {
    url.searchParams.set("offset", String(input.offset))
  }
  return url
}

async function fetchJson(url: URL, attempt = 0): Promise<unknown> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20_000)
  let response: Response

  try {
    response = await fetch(url, { signal: controller.signal })
  } catch (error) {
    clearTimeout(timeoutId)
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)))
      return fetchJson(url, attempt + 1)
    }
    throw error
  }

  clearTimeout(timeoutId)
  if (!response.ok) {
    if (response.status >= 500 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)))
      return fetchJson(url, attempt + 1)
    }
    throw new Error(`DMM API request failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchFloorItems(input: {
  floor: Floor
  sort: SortSource
  hits?: number
}) {
  const url = buildItemListUrl(input)
  const payload = (await fetchJson(url)) as { result?: { items?: DmmItem[] } }
  return payload.result?.items ?? []
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function numberFromUnknown(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function textFromUnknown(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function pickImageUrl(item: DmmItem) {
  const image = item.imageURL
  if (image && typeof image === "object") {
    for (const key of ["large", "list", "small"] as const) {
      const candidate = textFromUnknown((image as Record<string, unknown>)[key])
      if (candidate) return candidate
    }
  }
  return null
}

function pickPriceFields(item: DmmItem) {
  const prices = (item.prices as Record<string, unknown> | undefined) ?? {}
  const deliveries = asArray(
    (prices.deliveries as Record<string, unknown> | undefined)?.delivery as
      | Record<string, unknown>
      | Record<string, unknown>[]
      | undefined,
  )

  const currentFromDelivery = deliveries
    .map((entry) => numberFromUnknown(entry.price))
    .find((value) => value != null)
  const listFromDelivery = deliveries
    .map((entry) => numberFromUnknown(entry.list_price))
    .find((value) => value != null)

  const currentPrice =
    currentFromDelivery ??
    numberFromUnknown(prices.price) ??
    numberFromUnknown((prices.price as Record<string, unknown> | undefined)?.price) ??
    numberFromUnknown(item.price)

  const listPrice =
    listFromDelivery ??
    numberFromUnknown(prices.list_price) ??
    numberFromUnknown(prices.listPrice) ??
    numberFromUnknown(prices.regular_price)

  const pointRateRaw =
    numberFromUnknown((item.point as Record<string, unknown> | undefined)?.rate) ??
    numberFromUnknown((item.points as Record<string, unknown> | undefined)?.rate)
  const pointRate = pointRateRaw != null ? pointRateRaw / 100 : null

  const effectivePrice = currentPrice != null ? Math.round(currentPrice * (1 - (pointRate ?? 0))) : null
  const discountPct =
    currentPrice != null && listPrice != null && listPrice > currentPrice
      ? Number((1 - currentPrice / listPrice).toFixed(4))
      : null

  return {
    currentPrice,
    listPrice,
    pointRate,
    effectivePrice,
    discountPct,
    isOnSale: Boolean((listPrice != null && currentPrice != null && listPrice > currentPrice) || (pointRate ?? 0) > 0),
  }
}

function namesFromInfo(value: unknown) {
  if (!value) return []
  return asArray(value as Record<string, unknown>).flatMap((entry) => {
    const name = textFromUnknown((entry as Record<string, unknown>).name)
    return name ? [name] : []
  })
}

export function normalizeItem(input: {
  item: DmmItem
  floor: Floor
  sort: SortSource
  index: number
  fetchedAt: string
}): (CatalogWork & { releaseDate: string | null }) | null {
  const contentId = textFromUnknown(input.item.content_id) ?? textFromUnknown(input.item.product_id)
  if (!contentId) return null

  const itemInfo = (input.item.iteminfo as Record<string, unknown> | undefined) ?? {}
  const priceFields = pickPriceFields(input.item)
  const authors = namesFromInfo(input.item.author ?? itemInfo.author)

  const seriesName =
    namesFromInfo(input.item.series ?? itemInfo.series)[0] ??
    textFromUnknown((input.item.series as Record<string, unknown> | undefined)?.name)
  const makerName =
    namesFromInfo(input.item.maker ?? itemInfo.manufacture ?? itemInfo.maker)[0] ??
    textFromUnknown((input.item.maker as Record<string, unknown> | undefined)?.name)

  const tachiyomi = (input.item.tachiyomi as Record<string, unknown> | undefined) ?? {}

  return {
    workId: `ebook:${contentId}`,
    contentId,
    productId: textFromUnknown(input.item.product_id),
    title: textFromUnknown(input.item.title) ?? contentId,
    floor: FLOOR_ORDER.includes(input.floor) ? input.floor : "otherbooks",
    authors,
    series: seriesName ?? null,
    maker: makerName ?? null,
    isbn: textFromUnknown(input.item.isbn),
    imageUrl: pickImageUrl(input.item),
    affiliateUrl: textFromUnknown(input.item.affiliateURL) ?? textFromUnknown(input.item.URL),
    tachiyomiUrl: textFromUnknown(tachiyomi.affiliateURL) ?? textFromUnknown(tachiyomi.URL),
    latestPrice: priceFields.currentPrice,
    listPrice: priceFields.listPrice,
    pointRate: priceFields.pointRate,
    effectivePrice: priceFields.effectivePrice,
    discountPct: priceFields.discountPct,
    isOnSale: priceFields.isOnSale,
    badge: null,
    pastLowest: null,
    rankOrder: input.sort === "rank" ? input.index : null,
    dateOrder: input.sort === "date" ? input.index : null,
    releaseDate: textFromUnknown(input.item.date),
    lastCapturedAt: null,
  }
}
