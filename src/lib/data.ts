import type { CatalogWork, TopPayload, WorksIndexPayload } from "./catalog"

const jsonCache = new Map<string, Promise<unknown>>()

async function loadJson<T>(path: string): Promise<T> {
  if (!jsonCache.has(path)) {
    jsonCache.set(
      path,
      fetch(path, { cache: "no-store" }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${path}: ${response.status}`)
        }
        return response.json()
      }),
    )
  }
  return jsonCache.get(path) as Promise<T>
}

export function loadTopPayload(): Promise<TopPayload> {
  return loadJson<TopPayload>("/data/top.json")
}

export function loadWorksIndex(): Promise<WorksIndexPayload> {
  return loadJson<WorksIndexPayload>("/data/works-index.json")
}

export function loadWorkDetail(workId: string): Promise<CatalogWork> {
  return loadJson<CatalogWork>(`/data/works/${encodeURIComponent(workId)}.json`)
}
