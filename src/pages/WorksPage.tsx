import { startTransition, useDeferredValue, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { WorkTile } from "../components/WorkTile"
import type { CatalogWork, Floor, ViewDensity, WorksIndexPayload } from "../lib/catalog"
import { FLOOR_LABELS, FLOOR_ORDER } from "../lib/catalog"
import { loadWorksIndex } from "../lib/data"
import { formatUpdatedAt } from "../lib/format"

type SortMode = "rank" | "date" | "price-asc" | "price-desc" | "discount"

function sortWorks(works: CatalogWork[], sort: SortMode) {
  return [...works].sort((left, right) => {
    if (sort === "rank") {
      return (left.rankOrder ?? Number.MAX_SAFE_INTEGER) - (right.rankOrder ?? Number.MAX_SAFE_INTEGER)
    }
    if (sort === "date") {
      return (left.dateOrder ?? Number.MAX_SAFE_INTEGER) - (right.dateOrder ?? Number.MAX_SAFE_INTEGER)
    }
    if (sort === "price-asc") {
      return (left.currentPrice ?? Number.MAX_SAFE_INTEGER) - (right.currentPrice ?? Number.MAX_SAFE_INTEGER)
    }
    if (sort === "price-desc") {
      return (right.currentPrice ?? -1) - (left.currentPrice ?? -1)
    }
    const discountDelta = (right.discountPct ?? -1) - (left.discountPct ?? -1)
    if (discountDelta !== 0) return discountDelta
    return (right.pointRate ?? -1) - (left.pointRate ?? -1)
  })
}

export function WorksPage() {
  const [payload, setPayload] = useState<WorksIndexPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    document.title = "dmm-seli | 一覧"
    loadWorksIndex().then(setPayload).catch((loadError: Error) => setError(loadError.message))
  }, [])

  const density = (searchParams.get("density") === "dense" ? "dense" : "wide") as ViewDensity
  const sort = (searchParams.get("sort") ?? "rank") as SortMode
  const floor = searchParams.get("floor") as Floor | null
  const saleOnly = searchParams.get("sale") === "1"
  const keyword = searchParams.get("q") ?? ""
  const deferredKeyword = useDeferredValue(keyword.trim().toLowerCase())

  const filtered = sortWorks(
    (payload?.works ?? []).filter((work) => {
      if (floor && work.floor !== floor) return false
      if (saleOnly && !work.isOnSale) return false
      if (!deferredKeyword) return true
      const haystack = [work.title, work.maker, work.series, work.authors.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(deferredKeyword)
    }),
    sort,
  )

  function patchSearch(next: Record<string, string | null>) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      Object.entries(next).forEach(([key, value]) => {
        if (value == null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      setSearchParams(params, { replace: true })
    })
  }

  return (
    <div className="page page-works">
      <section className="works-hero">
        <div>
          <p className="hero-eyebrow">Index</p>
          <h1>作品一覧</h1>
          <p>DMM.com ebook 4フロアの rank / date 取得分を、キンセリ系の密度感で見られる一覧です。</p>
        </div>
        <dl>
          <div>
            <dt>更新</dt>
            <dd>{payload ? formatUpdatedAt(payload.updatedAt) : "読み込み中"}</dd>
          </div>
          <div>
            <dt>件数</dt>
            <dd>{payload ? `${payload.works.length}件` : "..."}</dd>
          </div>
        </dl>
      </section>

      <section className="toolbar">
        <label className="toolbar-search">
          <span>検索</span>
          <input
            onChange={(event) => patchSearch({ q: event.target.value || null })}
            placeholder="タイトル・著者・出版社"
            type="search"
            value={keyword}
          />
        </label>
        <div className="toolbar-group">
          {FLOOR_ORDER.map((candidate) => (
            <button
              className={floor === candidate ? "is-active" : ""}
              key={candidate}
              onClick={() => patchSearch({ floor: floor === candidate ? null : candidate })}
              type="button"
            >
              {FLOOR_LABELS[candidate]}
            </button>
          ))}
        </div>
        <div className="toolbar-inline">
          <label className="toolbar-toggle">
            <input
              checked={saleOnly}
              onChange={(event) => patchSearch({ sale: event.target.checked ? "1" : null })}
              type="checkbox"
            />
            <span>セール中のみ</span>
          </label>
          <select onChange={(event) => patchSearch({ sort: event.target.value })} value={sort}>
            <option value="rank">人気順</option>
            <option value="date">新着順</option>
            <option value="price-asc">価格が安い順</option>
            <option value="price-desc">価格が高い順</option>
            <option value="discount">割引率順</option>
          </select>
          <div className="density-toggle">
            <button
              className={density === "dense" ? "is-active" : ""}
              onClick={() => patchSearch({ density: "dense" })}
              type="button"
            >
              密
            </button>
            <button
              className={density === "wide" ? "is-active" : ""}
              onClick={() => patchSearch({ density: "wide" })}
              type="button"
            >
              広
            </button>
          </div>
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className={`works-grid works-grid--${density}`}>
        {filtered.map((work) => (
          <WorkTile density={density} key={work.workId} work={work} />
        ))}
      </section>

      {!filtered.length && !error ? (
        <p className="empty-copy">条件に合う作品がありません。検索語やフロア条件を外して再度確認してください。</p>
      ) : null}
    </div>
  )
}
