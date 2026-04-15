import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import type { CatalogWork } from "../lib/catalog"
import { FLOOR_LABELS, SORT_LABELS } from "../lib/catalog"
import { loadWorkDetail } from "../lib/data"
import { formatDiscount, formatPointRate, formatReleaseDate, formatUpdatedAt, formatYen } from "../lib/format"

export function WorkDetailPage() {
  const params = useParams()
  const [work, setWork] = useState<CatalogWork | null>(null)
  const [error, setError] = useState<string | null>(null)

  const workId = params.workId ? decodeURIComponent(params.workId) : ""

  useEffect(() => {
    if (!workId) return
    loadWorkDetail(workId).then(setWork).catch((loadError: Error) => setError(loadError.message))
  }, [workId])

  useEffect(() => {
    document.title = work ? `${work.title} | dmm-seli` : "dmm-seli | 詳細"
  }, [work])

  if (error) {
    return <p className="error-banner">{error}</p>
  }

  if (!work) {
    return <p className="empty-copy">詳細を読み込み中です。</p>
  }

  return (
    <div className="page page-detail">
      <Link className="back-link" to="/works">
        ← 一覧へ戻る
      </Link>

      <section className="detail-hero">
        <div className="detail-cover">
          {work.imageUrl ? <img alt={work.title} src={work.imageUrl} /> : <span>NO COVER</span>}
        </div>
        <div className="detail-copy">
          <div className="detail-pills">
            <span className="pill">{FLOOR_LABELS[work.floor]}</span>
            {work.sortSource.map((source) => (
              <span className="pill pill--subtle" key={source}>
                {SORT_LABELS[source]}
              </span>
            ))}
            {work.isOnSale ? <span className="pill pill--accent">{formatDiscount(work.discountPct)}</span> : null}
          </div>
          <h1>{work.title}</h1>
          <p className="detail-subtitle">
            {work.authors.length ? work.authors.join(" / ") : "著者情報なし"}
            {work.series ? ` ・ ${work.series}` : ""}
            {work.maker ? ` ・ ${work.maker}` : ""}
          </p>

          <dl className="price-panel">
            <div>
              <dt>現在価格</dt>
              <dd>{formatYen(work.currentPrice)}</dd>
            </div>
            <div>
              <dt>定価</dt>
              <dd>{formatYen(work.listPrice)}</dd>
            </div>
            <div>
              <dt>ポイント</dt>
              <dd>{formatPointRate(work.pointRate)}</dd>
            </div>
            <div>
              <dt>実質価格</dt>
              <dd>{formatYen(work.effectivePrice)}</dd>
            </div>
          </dl>

          <div className="detail-actions">
            {work.tachiyomiUrl ? (
              <a className="button button--primary" href={work.tachiyomiUrl} rel="noreferrer" target="_blank">
                試し読みへ
              </a>
            ) : null}
            {work.affiliateUrl ? (
              <a className="button button--ghost" href={work.affiliateUrl} rel="noreferrer" target="_blank">
                DMMで見る
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article>
          <h2>書誌情報</h2>
          <dl className="meta-list">
            <div>
              <dt>配信日</dt>
              <dd>{formatReleaseDate(work.releaseDate)}</dd>
            </div>
            <div>
              <dt>出版社</dt>
              <dd>{work.maker ?? "情報なし"}</dd>
            </div>
            <div>
              <dt>シリーズ</dt>
              <dd>{work.series ?? "情報なし"}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{work.isbn ?? "情報なし"}</dd>
            </div>
            <div>
              <dt>content_id</dt>
              <dd>{work.contentId}</dd>
            </div>
            <div>
              <dt>最終更新</dt>
              <dd>{formatUpdatedAt(work.fetchedAt)}</dd>
            </div>
          </dl>
        </article>

        <article>
          <h2>dmm-seli 上の扱い</h2>
          <p>
            この作品は
            {work.sortSource.map((source) => SORT_LABELS[source]).join(" / ")}
            の取得セットに含まれていました。v1 では価格履歴を保持しないため、過去最安や値下げ開始時刻は表示しません。
          </p>
        </article>
      </section>
    </div>
  )
}
