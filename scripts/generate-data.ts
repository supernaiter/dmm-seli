import fs from "node:fs/promises"
import path from "node:path"

import { FLOOR_ORDER, type CatalogWork, type Floor, type SortSource, type TopPayload, type WorksIndexPayload } from "../src/lib/catalog"
import { fetchFloorItems, normalizeItem } from "./lib/dmm-client"
import "./lib/env"

const outputDir = path.resolve(process.cwd(), "public/data")

function mergeWork(left: CatalogWork, right: CatalogWork): CatalogWork {
  return {
    ...left,
    ...right,
    authors: left.authors.length ? left.authors : right.authors,
    sortSource: [...new Set([...left.sortSource, ...right.sortSource])],
    rankOrder: left.rankOrder ?? right.rankOrder,
    dateOrder: left.dateOrder ?? right.dateOrder,
    imageUrl: left.imageUrl ?? right.imageUrl,
    affiliateUrl: left.affiliateUrl ?? right.affiliateUrl,
    tachiyomiUrl: left.tachiyomiUrl ?? right.tachiyomiUrl,
    maker: left.maker ?? right.maker,
    series: left.series ?? right.series,
    isbn: left.isbn ?? right.isbn,
    currentPrice: left.currentPrice ?? right.currentPrice,
    listPrice: left.listPrice ?? right.listPrice,
    pointRate: left.pointRate ?? right.pointRate,
    effectivePrice: left.effectivePrice ?? right.effectivePrice,
    discountPct: left.discountPct ?? right.discountPct,
    isOnSale: left.isOnSale || right.isOnSale,
    releaseDate: left.releaseDate ?? right.releaseDate,
  }
}

function sortByRank(works: CatalogWork[]) {
  return [...works].sort((left, right) => (left.rankOrder ?? Number.MAX_SAFE_INTEGER) - (right.rankOrder ?? Number.MAX_SAFE_INTEGER))
}

function sortByDate(works: CatalogWork[]) {
  return [...works].sort((left, right) => (left.dateOrder ?? Number.MAX_SAFE_INTEGER) - (right.dateOrder ?? Number.MAX_SAFE_INTEGER))
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

async function main() {
  const fetchedAt = new Date().toISOString()
  const registry = new Map<string, CatalogWork>()

  for (const floor of FLOOR_ORDER) {
    for (const sort of ["rank", "date"] as SortSource[]) {
      const items = await fetchFloorItems({ floor, sort, hits: 100 })
      items.forEach((item, index) => {
        const normalized = normalizeItem({
          item,
          floor,
          sort,
          index,
          fetchedAt,
        })
        if (!normalized) return
        const existing = registry.get(normalized.workId)
        registry.set(normalized.workId, existing ? mergeWork(existing, normalized) : normalized)
      })
    }
  }

  const works = [...registry.values()]
  const worksIndex: WorksIndexPayload = {
    updatedAt: fetchedAt,
    works: works.sort((left, right) => left.title.localeCompare(right.title, "ja")),
  }

  const popular = sortByRank(works).slice(0, 24)
  const newReleases = sortByDate(works).slice(0, 24)
  const featuredSales = [...works]
    .filter((work) => work.isOnSale)
    .sort((left, right) => {
      const discountDelta = (right.discountPct ?? -1) - (left.discountPct ?? -1)
      if (discountDelta !== 0) return discountDelta
      return (right.pointRate ?? -1) - (left.pointRate ?? -1)
    })
    .slice(0, 24)

  const floorCounts = FLOOR_ORDER.reduce(
    (accumulator, floor) => {
      accumulator[floor] = works.filter((work) => work.floor === floor).length
      return accumulator
    },
    {} as Record<Floor, number>,
  )

  const topPayload: TopPayload = {
    updatedAt: fetchedAt,
    featuredSales,
    popular,
    newReleases,
    floorCounts,
  }

  await fs.rm(outputDir, { recursive: true, force: true })
  await writeJson(path.join(outputDir, "works-index.json"), worksIndex)
  await writeJson(path.join(outputDir, "top.json"), topPayload)

  for (const work of works) {
    await writeJson(path.join(outputDir, "works", `${encodeURIComponent(work.workId)}.json`), work)
  }

  console.log(
    JSON.stringify({
      updatedAt: fetchedAt,
      works: works.length,
      featuredSales: featuredSales.length,
    }),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
