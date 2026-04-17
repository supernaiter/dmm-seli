import type { CatalogWork, FloorsPayload, SortMode, WorkDetail } from "./catalog"

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`)
  }
  return response.json()
}

export function loadFloorsPayload() {
  return apiFetch<FloorsPayload>("/api/floors")
}

export function loadProducts(input: {
  floor?: string | null
  q?: string | null
  sort?: SortMode
  sale?: boolean
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()
  if (input.floor) params.set("floor", input.floor)
  if (input.q) params.set("q", input.q)
  if (input.sort) params.set("sort", input.sort)
  if (input.sale) params.set("sale", "1")
  if (input.limit != null) params.set("limit", String(input.limit))
  if (input.offset != null) params.set("offset", String(input.offset))
  const query = params.toString()
  return apiFetch<CatalogWork[]>(`/api/products${query ? `?${query}` : ""}`)
}

export function loadWorkDetail(workId: string) {
  return apiFetch<WorkDetail>(`/api/products/${encodeURIComponent(workId)}`)
}
