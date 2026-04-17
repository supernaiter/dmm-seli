import type { PagesFunction } from "@cloudflare/workers-types"

import { createDb, listTrackedWorks } from "../../server/db"
import { toCatalogWork } from "../../server/metrics"
import { sortCatalogWorks } from "../../src/lib/catalog"
import { getDatabaseUrl, json, parseFloor, parseLimit, parseOffset, parseSort, serverError } from "./_utils"

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const sql = createDb(getDatabaseUrl(context))
    const rows = await listTrackedWorks(sql)
    const url = new URL(context.request.url)
    const floor = parseFloor(url.searchParams.get("floor"))
    const sort = parseSort(url.searchParams.get("sort"))
    const limit = parseLimit(url.searchParams.get("limit"), 240)
    const offset = parseOffset(url.searchParams.get("offset"))
    const saleOnly = url.searchParams.get("sale") === "1"
    const keyword = (url.searchParams.get("q") ?? "").trim().toLowerCase()

    const filtered = sortCatalogWorks(
      rows
        .map(toCatalogWork)
        .filter((work) => {
          if (floor && work.floor !== floor) return false
          if (saleOnly && !work.isOnSale) return false
          if (!keyword) return true
          const haystack = [work.title, work.series, work.maker, work.authors.join(" ")]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return haystack.includes(keyword)
        }),
      sort,
    )

    return json(filtered.slice(offset, offset + limit))
  } catch (error) {
    return serverError(error)
  }
}
