import type { PagesFunction } from "@cloudflare/workers-types"

import { createDb, getTrackedWork, listAllSnapshotPrices, listRecentSnapshots } from "../../../server/db"
import { toWorkDetail } from "../../../server/metrics"
import { getDatabaseUrl, notFound, json, serverError } from "../_utils"

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const sql = createDb(getDatabaseUrl(context))
    const workId = decodeURIComponent(String(context.params.workId ?? ""))
    const row = await getTrackedWork(sql, workId)

    if (!row) {
      return notFound("Work not found")
    }

    const [recentSnapshots, allPrices] = await Promise.all([
      listRecentSnapshots(sql, workId, 30),
      listAllSnapshotPrices(sql, workId),
    ])

    return json(toWorkDetail(row, recentSnapshots, allPrices))
  } catch (error) {
    return serverError(error)
  }
}
