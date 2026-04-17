import type { PagesFunction } from "@cloudflare/workers-types"

import { createDb, pingDatabase } from "../../server/db"
import { getDatabaseUrl, json } from "./_utils"

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const sql = createDb(getDatabaseUrl(context))
    const ok = await pingDatabase(sql)
    return json({ ok, db: ok ? "ok" : "fail" }, ok ? 200 : 500)
  } catch {
    return json({ ok: false, db: "fail" }, 500)
  }
}
