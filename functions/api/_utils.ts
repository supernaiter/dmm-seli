import type { PagesFunction } from "@cloudflare/workers-types"

import type { Floor, SortMode } from "../../src/lib/catalog"

export type PagesEnv = {
  DATABASE_URL?: string
}

export type PagesContext = Parameters<PagesFunction<PagesEnv>>[0]

export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

export function badRequest(message: string) {
  return json({ error: message }, 400)
}

export function notFound(message = "Not found") {
  return json({ error: message }, 404)
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error"
  return json({ error: message }, 500)
}

export function getDatabaseUrl(context: PagesContext) {
  const url = context.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is missing")
  }
  return url
}

export function parseFloor(value: string | null): Floor | null {
  if (value === "comic" || value === "novel" || value === "otherbooks" || value === "photo") {
    return value
  }
  return null
}

export function parseSort(value: string | null): SortMode {
  if (value === "date" || value === "price_asc" || value === "price_desc" || value === "discount") {
    return value
  }
  return "rank"
}

export function parseLimit(value: string | null, fallback = 200) {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, 1000)
}

export function parseOffset(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}
