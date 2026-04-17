import { startTransition, useDeferredValue, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { WorkTile } from "../components/WorkTile"
import type { CatalogWork, Floor, FloorsPayload, SortMode, ViewDensity } from "../lib/catalog"
import { FLOOR_LABELS, FLOOR_ORDER } from "../lib/catalog"
import { loadFloorsPayload, loadProducts } from "../lib/data"
import { formatUpdatedAt } from "../lib/format"

export function TrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [floors, setFloors] = useState<FloorsPayload | null>(null)
  const [popular, setPopular] = useState<CatalogWork[]>([])
  const [fresh, setFresh] = useState<CatalogWork[]>([])
  const [works, setWorks] = useState<CatalogWork[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  const density = (searchParams.get("density") === "dense" ? "dense" : "wide") as ViewDensity
  const sort = (searchParams.get("sort") ?? "rank") as SortMode
  const floor = searchParams.get("floor") as Floor | null
  const saleOnly = searchParams.get("sale") === "1"
  const keyword = searchParams.get("q") ?? ""
  const deferredKeyword = useDeferredValue(keyword.trim())

  useEffect(() => {
    document.title = "dmm-seli | 価格トラッカー"
    Promise.all([
      loadFloorsPayload(),
      loadProducts({ sort: "rank", limit: 12 }),
      loadProducts({ sort: "date", limit: 12 }),
    ])
      .then(([floorsPayload, popularItems, freshItems]) => {
        setFloors(floorsPayload)
        setPopular(popularItems)
        setFresh(freshItems)
      })
      .catch((loadError: Error) => setError(loadError.message))
  }, [])

  useEffect(() => {
    setLoadingList(true)
    loadProducts({
      floor,
      q: deferredKeyword || null,
      sort,
      sale: saleOnly,
      limit: 1000,
      offset: 0,
    })
      .then((items) => {
        setWorks(items)
        setError(null)
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoadingList(false))
  }, [deferredKeyword, floor, saleOnly, sort])

  function patchSearch(next: Record<string, string | null>) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      Object.entries(next).forEach(([key, value]) => {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      setSearchParams(params, { replace: true })
    })
  }

  return (
    <div className="page page-tracker">
      <section className="tracker-lead">
        <div>
          <p className="hero-eyebrow">Kinseri-flavored tracker</p>
          <h1>dmm-seli</h1>
          <p>
            DMM.com ebook 4フロアを、一覧主導で追うための価格トラッカーです。過去最安、30日/180日最安、相場帯、
            実質価格まで同じ視線で見られる形に寄せています。
          </p>
        </div>
        <div className="tracker-lead-meta">
          <div>
            <dt>最終更新</dt>
            <dd>{floors ? formatUpdatedAt(floors.updatedAt) : "読込中"}</dd>
          </div>
          <div>
            <dt>追跡件数</dt>
            <dd>{floors ? `${Object.values(floors.counts).reduce((sum, count) => sum + count, 0)}件` : "..."}</dd>
          </div>
          <div>
            <dt>導線</dt>
            <dd>
              <a href="https://yapi.ta2o.net/kndlsl/" rel="noreferrer" target="_blank">
                Kindle はキンセリへ
              </a>
            </dd>
          </div>
        </div>
      </section>

      <section className="tracker-rails">
        <article>
          <div className="section-head">
            <p className="section-eyebrow">Featured</p>
            <h2>注目値動き</h2>
          </div>
          <div className="rail-grid">
            {(floors?.featured ?? []).slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        </article>

        <article>
          <div className="section-head">
            <p className="section-eyebrow">Popular</p>
            <h2>人気作品</h2>
          </div>
          <div className="rail-grid">
            {popular.slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        </article>

        <article>
          <div className="section-head">
            <p className="section-eyebrow">Fresh</p>
            <h2>新着作品</h2>
          </div>
          <div className="rail-grid">
            {fresh.slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        </article>
      </section>

      <section className="tracker-toolbar">
        <div className="tracker-toolbar__top">
          <div className="toolbar-copy">
            <p className="section-eyebrow">Tracker</p>
            <h2>追跡一覧</h2>
          </div>
          <div className="toolbar-updated">
            <span>表示件数</span>
            <strong>{loadingList ? "..." : `${works.length}件`}</strong>
          </div>
        </div>

        <div className="toolbar-search">
          <label>
            <span>検索</span>
            <input
              onChange={(event) => patchSearch({ q: event.target.value || null })}
              placeholder="タイトル・著者・出版社"
              type="search"
              value={keyword}
            />
          </label>
        </div>

        <div className="toolbar-filters">
          <div className="toolbar-group">
            <button className={!floor ? "is-active" : ""} onClick={() => patchSearch({ floor: null })} type="button">
              全部
            </button>
            {FLOOR_ORDER.map((candidate) => (
              <button
                className={floor === candidate ? "is-active" : ""}
                key={candidate}
                onClick={() => patchSearch({ floor: candidate })}
                type="button"
              >
                {FLOOR_LABELS[candidate]}
                <small>{floors ? floors.counts[candidate] : "..."}</small>
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
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
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
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className={`works-grid works-grid--${density}`}>
        {works.map((work) => (
          <WorkTile density={density} key={work.workId} work={work} />
        ))}
      </section>

      {!loadingList && !works.length && !error ? (
        <div className="empty-state">
          <p>条件に合う作品がありません。</p>
          <Link className="button button--ghost" to="/">
            条件をリセット
          </Link>
        </div>
      ) : null}
    </div>
  )
}
