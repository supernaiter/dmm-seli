import { neon } from "@neondatabase/serverless"

import type { CatalogWork, Floor } from "../src/lib/catalog"

type Sql = ReturnType<typeof neon<false, false>>

type NullableNumber = number | null

export type WorkStateRow = {
  work_id: string
  latest_price: NullableNumber
  list_price: NullableNumber
  point_rate: NullableNumber
  last_price_snapshot_at: string | null
}

export type WorkRow = {
  work_id: string
  content_id: string
  product_id: string | null
  title: string
  floor: Floor
  authors: unknown
  authors_text: string
  series: string | null
  maker: string | null
  isbn: string | null
  image_url: string | null
  affiliate_url: string | null
  tachiyomi_url: string | null
  release_date: string | null
  rank_order: number | null
  date_order: number | null
  latest_price: NullableNumber
  list_price: NullableNumber
  point_rate: NullableNumber
  effective_price: NullableNumber
  discount_pct: NullableNumber
  is_on_sale: boolean
  last_seen_at: string
  last_price_snapshot_at: string | null
  updated_at: string
  past_lowest: NullableNumber
  min_180: NullableNumber
  min_30: NullableNumber
}

export type SnapshotRow = {
  captured_at: string
  current_price: number
  list_price: NullableNumber
  point_rate: NullableNumber
  effective_price: NullableNumber
  discount_pct: NullableNumber
}

export function createDb(connectionString: string) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing")
  }
  return neon(connectionString)
}

export async function migrateDatabase(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS works (
      work_id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      product_id TEXT,
      title TEXT NOT NULL,
      floor TEXT NOT NULL CHECK (floor IN ('comic', 'novel', 'otherbooks', 'photo')),
      authors JSONB NOT NULL DEFAULT '[]'::jsonb,
      authors_text TEXT NOT NULL DEFAULT '',
      series TEXT,
      maker TEXT,
      isbn TEXT,
      image_url TEXT,
      affiliate_url TEXT,
      tachiyomi_url TEXT,
      release_date TEXT,
      rank_order INTEGER,
      date_order INTEGER,
      latest_price INTEGER,
      list_price INTEGER,
      point_rate DOUBLE PRECISION,
      effective_price INTEGER,
      discount_pct DOUBLE PRECISION,
      is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
      last_seen_at TIMESTAMPTZ NOT NULL,
      last_price_snapshot_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      id BIGSERIAL PRIMARY KEY,
      work_id TEXT NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
      current_price INTEGER NOT NULL,
      list_price INTEGER,
      point_rate DOUBLE PRECISION,
      effective_price INTEGER,
      discount_pct DOUBLE PRECISION,
      captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_works_floor ON works(floor)`
  await sql`CREATE INDEX IF NOT EXISTS idx_works_rank_order ON works(rank_order)`
  await sql`CREATE INDEX IF NOT EXISTS idx_works_date_order ON works(date_order)`
  await sql`CREATE INDEX IF NOT EXISTS idx_works_last_seen_at ON works(last_seen_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_price_snapshots_work_time ON price_snapshots(work_id, captured_at DESC)`
}

export async function listTrackedWorks(sql: Sql) {
  return (await sql`
    SELECT
      w.work_id,
      w.content_id,
      w.product_id,
      w.title,
      w.floor,
      w.authors,
      w.authors_text,
      w.series,
      w.maker,
      w.isbn,
      w.image_url,
      w.affiliate_url,
      w.tachiyomi_url,
      w.release_date,
      w.rank_order,
      w.date_order,
      w.latest_price,
      w.list_price,
      w.point_rate,
      w.effective_price,
      w.discount_pct,
      w.is_on_sale,
      w.last_seen_at,
      w.last_price_snapshot_at,
      w.updated_at,
      stats.past_lowest,
      stats.min_180,
      stats.min_30
    FROM works w
    LEFT JOIN (
      SELECT
        work_id,
        MIN(current_price) AS past_lowest,
        MIN(current_price) FILTER (WHERE captured_at >= NOW() - INTERVAL '180 days') AS min_180,
        MIN(current_price) FILTER (WHERE captured_at >= NOW() - INTERVAL '30 days') AS min_30
      FROM price_snapshots
      GROUP BY work_id
    ) stats ON stats.work_id = w.work_id
  `) as WorkRow[]
}

export async function getTrackedWork(sql: Sql, workId: string) {
  const rows = (await sql`
    SELECT
      w.work_id,
      w.content_id,
      w.product_id,
      w.title,
      w.floor,
      w.authors,
      w.authors_text,
      w.series,
      w.maker,
      w.isbn,
      w.image_url,
      w.affiliate_url,
      w.tachiyomi_url,
      w.release_date,
      w.rank_order,
      w.date_order,
      w.latest_price,
      w.list_price,
      w.point_rate,
      w.effective_price,
      w.discount_pct,
      w.is_on_sale,
      w.last_seen_at,
      w.last_price_snapshot_at,
      w.updated_at,
      stats.past_lowest,
      stats.min_180,
      stats.min_30
    FROM works w
    LEFT JOIN (
      SELECT
        work_id,
        MIN(current_price) AS past_lowest,
        MIN(current_price) FILTER (WHERE captured_at >= NOW() - INTERVAL '180 days') AS min_180,
        MIN(current_price) FILTER (WHERE captured_at >= NOW() - INTERVAL '30 days') AS min_30
      FROM price_snapshots
      GROUP BY work_id
    ) stats ON stats.work_id = w.work_id
    WHERE w.work_id = ${workId}
    LIMIT 1
  `) as WorkRow[]
  return rows[0] ?? null
}

export async function listRecentSnapshots(sql: Sql, workId: string, limit = 30) {
  return (await sql`
    SELECT
      captured_at,
      current_price,
      list_price,
      point_rate,
      effective_price,
      discount_pct
    FROM price_snapshots
    WHERE work_id = ${workId}
    ORDER BY captured_at DESC
    LIMIT ${limit}
  `) as SnapshotRow[]
}

export async function listAllSnapshotPrices(sql: Sql, workId: string) {
  const rows = (await sql`
    SELECT current_price
    FROM price_snapshots
    WHERE work_id = ${workId}
    ORDER BY captured_at DESC
  `) as Array<{ current_price: number }>
  return rows.map((row) => row.current_price)
}

export async function getWorkStates(sql: Sql) {
  return (await sql`
    SELECT work_id, latest_price, list_price, point_rate, last_price_snapshot_at
    FROM works
  `) as WorkStateRow[]
}

export async function upsertTrackedWork(
  sql: Sql,
  work: CatalogWork & { productId: string | null; isbn: string | null; releaseDate: string | null },
  capturedAt: string,
) {
  await sql`
    INSERT INTO works (
      work_id,
      content_id,
      product_id,
      title,
      floor,
      authors,
      authors_text,
      series,
      maker,
      isbn,
      image_url,
      affiliate_url,
      tachiyomi_url,
      release_date,
      rank_order,
      date_order,
      latest_price,
      list_price,
      point_rate,
      effective_price,
      discount_pct,
      is_on_sale,
      last_seen_at,
      updated_at
    ) VALUES (
      ${work.workId},
      ${work.contentId},
      ${work.productId},
      ${work.title},
      ${work.floor},
      ${JSON.stringify(work.authors)}::jsonb,
      ${work.authors.join(" ")},
      ${work.series},
      ${work.maker},
      ${work.isbn},
      ${work.imageUrl},
      ${work.affiliateUrl},
      ${work.tachiyomiUrl},
      ${work.releaseDate},
      ${work.rankOrder},
      ${work.dateOrder},
      ${work.latestPrice},
      ${work.listPrice},
      ${work.pointRate},
      ${work.effectivePrice},
      ${work.discountPct},
      ${work.isOnSale},
      ${capturedAt}::timestamptz,
      ${capturedAt}::timestamptz
    )
    ON CONFLICT (work_id) DO UPDATE SET
      content_id = EXCLUDED.content_id,
      product_id = EXCLUDED.product_id,
      title = EXCLUDED.title,
      floor = EXCLUDED.floor,
      authors = EXCLUDED.authors,
      authors_text = EXCLUDED.authors_text,
      series = EXCLUDED.series,
      maker = EXCLUDED.maker,
      isbn = EXCLUDED.isbn,
      image_url = EXCLUDED.image_url,
      affiliate_url = EXCLUDED.affiliate_url,
      tachiyomi_url = EXCLUDED.tachiyomi_url,
      release_date = EXCLUDED.release_date,
      rank_order = EXCLUDED.rank_order,
      date_order = EXCLUDED.date_order,
      latest_price = EXCLUDED.latest_price,
      list_price = EXCLUDED.list_price,
      point_rate = EXCLUDED.point_rate,
      effective_price = EXCLUDED.effective_price,
      discount_pct = EXCLUDED.discount_pct,
      is_on_sale = EXCLUDED.is_on_sale,
      last_seen_at = EXCLUDED.last_seen_at,
      updated_at = EXCLUDED.updated_at
  `
}

export async function setLastSnapshotAt(sql: Sql, workId: string, capturedAt: string) {
  await sql`
    UPDATE works
    SET last_price_snapshot_at = ${capturedAt}::timestamptz,
        updated_at = ${capturedAt}::timestamptz
    WHERE work_id = ${workId}
  `
}

export async function insertPriceSnapshot(
  sql: Sql,
  work: CatalogWork,
  capturedAt: string,
) {
  if (work.latestPrice == null) {
    return
  }

  await sql`
    INSERT INTO price_snapshots (
      work_id,
      current_price,
      list_price,
      point_rate,
      effective_price,
      discount_pct,
      captured_at
    ) VALUES (
      ${work.workId},
      ${work.latestPrice},
      ${work.listPrice},
      ${work.pointRate},
      ${work.effectivePrice},
      ${work.discountPct},
      ${capturedAt}::timestamptz
    )
  `
  await setLastSnapshotAt(sql, work.workId, capturedAt)
}

export async function pingDatabase(sql: Sql) {
  const rows = (await sql`SELECT 1 AS ok`) as Array<{ ok: number }>
  return rows[0]?.ok === 1
}
