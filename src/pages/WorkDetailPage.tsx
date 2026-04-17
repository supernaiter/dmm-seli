import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import type { WorkDetail } from "../lib/catalog"
import { FLOOR_LABELS } from "../lib/catalog"
import { loadWorkDetail } from "../lib/data"
import { formatDiscount, formatPointRate, formatReleaseDate, formatUpdatedAt, formatYen } from "../lib/format"

export function WorkDetailPage() {
  const params = useParams()
  const [work, setWork] = useState<WorkDetail | null>(null)
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
      <Link className="back-link" to="/">
        ← 一覧へ戻る
      </Link>

      <section className="detail-hero">
        <div className="detail-cover">
          {work.imageUrl ? <img alt={work.title} src={work.imageUrl} /> : <span>NO COVER</span>}
        </div>
        <div className="detail-copy">
          <div className="detail-pills">
            <span className="pill">{FLOOR_LABELS[work.floor]}</span>
            {work.badge ? <span className="pill pill--badge">{work.badge}</span> : null}
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
              <dd>{formatYen(work.latestPrice)}</dd>
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

      <section className="detail-stat-grid">
        <article className="detail-stat-card">
          <h2>過去最安</h2>
          <strong>{formatYen(work.pastLowest)}</strong>
        </article>
        <article className="detail-stat-card">
          <h2>相場帯</h2>
          <strong>
            {formatYen(work.bandMin)} - {formatYen(work.bandMax)}
          </strong>
        </article>
        <article className="detail-stat-card">
          <h2>よくある価格</h2>
          <strong>{formatYen(work.mode)}</strong>
        </article>
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
              <dd>{formatUpdatedAt(work.updatedAt)}</dd>
            </div>
          </dl>
        </article>

        <article>
          <h2>価格履歴</h2>
          {work.history.length ? (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>価格</th>
                    <th>定価</th>
                    <th>ポイント</th>
                    <th>実質</th>
                  </tr>
                </thead>
                <tbody>
                  {work.history.map((point) => (
                    <tr key={point.capturedAt}>
                      <td>{point.dateLabel}</td>
                      <td>{formatYen(point.price)}</td>
                      <td>{formatYen(point.listPrice)}</td>
                      <td>{formatPointRate(point.pointRate)}</td>
                      <td>{formatYen(point.effectivePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>この作品はまだ価格履歴がありません。</p>
          )}
        </article>
      </section>
    </div>
  )
}
