import { startTransition, useDeferredValue, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { HeroShelf } from "../components/HeroShelf"
import { WorkTile } from "../components/WorkTile"
import type { CatalogWork, Floor, FloorsPayload, SortMode, ViewDensity } from "../lib/catalog"
import { FLOOR_LABELS, FLOOR_ORDER, SORT_MODE_LABELS } from "../lib/catalog"
import { loadFloorsPayload, loadProducts } from "../lib/data"
import { formatUpdatedAt } from "../lib/format"

const SORT_MODE_OPTIONS: SortMode[] = ["rank", "date", "discount", "price_asc", "price_desc"]

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
      .catch((loadError: Error) => {
        console.error(loadError)
        setError("データの読み込みに失敗しました。時間をおいて再読み込みしてください。")
      })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadList() {
      setLoadingList(true)
      try {
        const items = await loadProducts({
          floor,
          q: deferredKeyword || null,
          sort,
          sale: saleOnly,
          limit: 1000,
          offset: 0,
        })
        if (cancelled) return
        setWorks(items)
        setError(null)
      } catch (loadError) {
        if (cancelled) return
        console.error(loadError)
        setError("データの読み込みに失敗しました。時間をおいて再読み込みしてください。")
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    }

    void loadList()

    return () => {
      cancelled = true
    }
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

  const featuredWorks = floors?.featured ?? []
  const activeFilters = [
    floor ? FLOOR_LABELS[floor] : "全フロア",
    saleOnly ? "セール中のみ" : null,
    keyword ? `検索: ${keyword}` : null,
    SORT_MODE_LABELS[sort],
    density === "dense" ? "密表示" : "広表示",
  ].filter(Boolean)
  const hasActiveRefine = Boolean(floor || saleOnly || keyword || sort !== "rank" || density !== "wide")

  return (
    <div className="page page-tracker">
      <section className="tracker-lead">
        <div className="tracker-lead-copy">
          <div>
            <p className="hero-eyebrow">キンセリ風 価格トラッカー</p>
            <h1>dmm-seli</h1>
            <p>
              DMM.com ebook 4フロアを、一覧主導で追うための価格トラッカーです。値動きが大きい作品、人気作品、新着作品を
              先に見てから、同じ画面のまま追跡一覧へ降りる流れに寄せています。
            </p>
            <p>Kindle の価格は兄弟サイトのキンセリ、DMM の価格は dmm-seli で追う一文で案内できます。</p>
          </div>

          <div className="tracker-jump-grid">
            <a href="#featured">注目値動き</a>
            <a href="#popular">人気作品</a>
            <a href="#fresh">新着作品</a>
            <a href="#tracker-list">追跡一覧</a>
          </div>

          <div className="tracker-stats-grid">
            <div className="tracker-stat-card">
              <dt>最終更新</dt>
              <dd>{floors ? formatUpdatedAt(floors.updatedAt) : "読込中"}</dd>
            </div>
            <div className="tracker-stat-card">
              <dt>追跡件数</dt>
              <dd>{floors ? `${Object.values(floors.counts).reduce((sum, count) => sum + count, 0)}件` : "..."}</dd>
            </div>
          </div>
        </div>
        <div className="tracker-lead-visual">
          <HeroShelf works={[...featuredWorks, ...popular, ...fresh]} />
        </div>
      </section>

      <section className="tracker-floor-strip">
        <button className={!floor ? "is-active" : ""} onClick={() => patchSearch({ floor: null })} type="button">
          <span>全フロア</span>
          <strong>{floors ? `${Object.values(floors.counts).reduce((sum, count) => sum + count, 0)}件` : "..."}</strong>
        </button>
        {FLOOR_ORDER.map((candidate) => (
          <button
            className={floor === candidate ? "is-active" : ""}
            key={candidate}
            onClick={() => patchSearch({ floor: candidate })}
            type="button"
          >
            <span>{FLOOR_LABELS[candidate]}</span>
            <strong>{floors ? `${floors.counts[candidate]}件` : "..."}</strong>
          </button>
        ))}
      </section>

      <section className="tracker-rails">
        <article id="featured">
          <div className="section-head">
            <p className="section-eyebrow">注目</p>
            <h2>注目値動き</h2>
          </div>
          <div className="rail-grid">
            {featuredWorks.slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        </article>

        <article id="popular">
          <div className="section-head">
            <p className="section-eyebrow">人気</p>
            <h2>人気作品</h2>
          </div>
          <div className="rail-grid">
            {popular.slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        </article>

        <article id="fresh">
          <div className="section-head">
            <p className="section-eyebrow">新着</p>
            <h2>新着作品</h2>
          </div>
          <div className="rail-grid">
            {fresh.slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        </article>
      </section>

      <section className="tracker-toolbar" id="tracker-list">
        <div className="tracker-toolbar__top">
          <div className="toolbar-copy">
            <p className="section-eyebrow">一覧</p>
            <h2>追跡一覧</h2>
          </div>
          <div className="toolbar-summary-card">
            <div className="toolbar-updated">
              <span>最終更新</span>
              <strong>{floors ? formatUpdatedAt(floors.updatedAt) : "..."}</strong>
            </div>
            <div className="toolbar-updated">
              <span>表示件数</span>
              <strong>{loadingList ? "..." : `${works.length}件`}</strong>
            </div>
            {hasActiveRefine ? (
              <button
                className="toolbar-reset"
                onClick={() => patchSearch({ floor: null, sale: null, q: null, sort: null, density: null })}
                type="button"
              >
                絞り込みを外す
              </button>
            ) : null}
          </div>
        </div>

        <div className="toolbar-summary">
          <p>人気・新着・値動きから拾って、そのまま一覧で絞り込む流れを前提にしています。</p>
          <div className="toolbar-chips">
            {activeFilters.map((label) => (
              <span className="pill" key={label}>
                {label}
              </span>
            ))}
          </div>
          <div className="tracker-cta-note">
            <strong>最短導線:</strong>
            <span>一覧で価格差を見つける → 詳細で理由を確認 → DMM へ進む</span>
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

        <div className="toolbar-panel">
          <div className="toolbar-sort-rail">
            <span>並び順</span>
            <div className="toolbar-group">
              {SORT_MODE_OPTIONS.map((candidate) => (
                <button
                  className={sort === candidate ? "is-active" : ""}
                  key={candidate}
                  onClick={() => patchSearch({ sort: candidate === "rank" ? null : candidate })}
                  type="button"
                >
                  {SORT_MODE_LABELS[candidate]}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-filters">
            <div className="toolbar-inline toolbar-inline--start">
              <label className="toolbar-toggle">
                <input
                  checked={saleOnly}
                  onChange={(event) => patchSearch({ sale: event.target.checked ? "1" : null })}
                  type="checkbox"
                />
                <span>セール中のみ</span>
              </label>

              <div className="density-toggle">
                <button
                  className={density === "dense" ? "is-active" : ""}
                  onClick={() => patchSearch({ density: "dense" })}
                  type="button"
                >
                  密表示
                </button>
                <button
                  className={density === "wide" ? "is-active" : ""}
                  onClick={() => patchSearch({ density: null })}
                  type="button"
                >
                  広表示
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="error-banner">
          <span>{error}</span>
          <button className="button button--ghost" onClick={() => window.location.reload()} type="button">
            再読み込み
          </button>
        </div>
      ) : null}

      <section className={`works-grid works-grid--${density}`}>
        {works.map((work) => (
          <WorkTile density={density} key={work.workId} work={work} />
        ))}
      </section>

      {!loadingList && !works.length && !error ? (
        <div className="empty-state">
          <p>条件に合う作品がありません。</p>
          <p>フロアか検索条件を外して、別の作品群に切り替えてください。</p>
          <Link className="button button--ghost" to="/">
            条件をリセット
          </Link>
        </div>
      ) : null}
    </div>
  )
}
