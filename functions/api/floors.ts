import type { PagesFunction } from "@cloudflare/workers-types"

import { createDb, listTrackedWorks } from "../../server/db"
import { toCatalogWork } from "../../server/metrics"
import { FLOOR_ORDER } from "../../src/lib/catalog"
import { getDatabaseUrl, json, serverError } from "./_utils"

const BADGE_PRIORITY = new Map([
  ["過去最安", 0],
  ["180日最安", 1],
  ["30日最安", 2],
])

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const sql = createDb(getDatabaseUrl(context))
    const rows = await listTrackedWorks(sql)
    const works = rows.map(toCatalogWork)
    const updatedAt = rows.reduce((latest, row) => (row.updated_at > latest ? row.updated_at : latest), "")
    const featured = works
      .filter((work) => work.badge != null)
      .sort((left, right) => {
        const badgeDelta = (BADGE_PRIORITY.get(left.badge ?? "") ?? 99) - (BADGE_PRIORITY.get(right.badge ?? "") ?? 99)
        if (badgeDelta !== 0) return badgeDelta
        const discountDelta = (right.discountPct ?? -1) - (left.discountPct ?? -1)
        if (discountDelta !== 0) return discountDelta
        return (right.pointRate ?? -1) - (left.pointRate ?? -1)
      })
      .slice(0, 12)

    const counts = FLOOR_ORDER.reduce(
      (accumulator, floor) => {
        accumulator[floor] = works.filter((work) => work.floor === floor).length
        return accumulator
      },
      {} as Record<(typeof FLOOR_ORDER)[number], number>,
    )

    return json({
      updatedAt,
      counts,
      featured,
    })
  } catch (error) {
    return serverError(error)
  }
}
