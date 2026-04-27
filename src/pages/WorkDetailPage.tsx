import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { CoverImage } from "../components/CoverImage"
import type { WorkDetail } from "../lib/catalog"
import { FLOOR_LABELS } from "../lib/catalog"
import { loadWorkDetail } from "../lib/data"
import { toSafeExternalUrl } from "../lib/external"
import { formatDiscount, formatPointRate, formatReleaseDate, formatUpdatedAt, formatYen } from "../lib/format"

function describeBandPosition(current: number | null, bandMin: number | null, bandMax: number | null) {
  if (current == null || bandMin == null || bandMax == null) return "相場帯情報なし"
  if (current <= bandMin) return "相場帯の下限"
  if (current >= bandMax) return "相場帯の上限"
  return "相場帯の中ほど"
}

function describeModeGap(current: number | null, mode: number | null) {
  if (current == null || mode == null) return "よくある価格との比較なし"
  if (current === mode) return "よくある価格と同水準"
  const diff = Math.abs(current - mode)
  return current < mode ? `よくある価格より ${formatYen(diff)} 安い` : `よくある価格より ${formatYen(diff)} 高い`
}

function describeRecentTrend(current: number | null, historyPrices: number[]) {
  if (current == null || historyPrices.length < 2) return "最近の比較データなし"
  const recentWindow = historyPrices.slice(0, Math.min(historyPrices.length, 7))
  const recentMin = Math.min(...recentWindow)
  const recentMax = Math.max(...recentWindow)
  if (current <= recentMin) return "直近では安い水準"
  if (current >= recentMax) return "直近では高い水準"
  return "直近の中間水準"
}

function describeSalesStatus(affiliateUrl: string | null, latestPrice: number | null) {
  if (!affiliateUrl) return "DMMリンク未取得"
  if (latestPrice == null) return "価格取得待ち"
  return "DMM掲載中"
}

function describePriceBenefits(discountPct: number | null, pointRate: number | null) {
  const discount = discountPct && discountPct > 0 ? formatDiscount(discountPct) : "割引なし"
  const points = pointRate && pointRate > 0 ? formatPointRate(pointRate) : "還元なし"
  return `${discount} / ${points}`
}

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
    return (
      <div className="page page-detail">
        <Link className="back-link" to="/">
          ← 一覧へ戻る
        </Link>
        <div className="error-banner">
          <span>{error}</span>
          <Link className="button button--ghost" to="/">
            一覧へ戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!work) {
    return <p className="empty-copy">詳細を読み込み中です。</p>
  }

  const latestHistory = work.history[0] ?? null
  const recentHistory = work.history.slice(0, 6)
  const historyPrices = work.history.map((point) => point.price)
  const bandPosition = describeBandPosition(work.latestPrice, work.bandMin, work.bandMax)
  const modeGap = describeModeGap(work.latestPrice, work.mode)
  const recentTrend = describeRecentTrend(work.latestPrice, historyPrices)
  const affiliateUrl = toSafeExternalUrl(work.affiliateUrl)
  const tachiyomiUrl = toSafeExternalUrl(work.tachiyomiUrl)
  const salesStatus = describeSalesStatus(affiliateUrl, work.latestPrice)
  const purchaseReasons = [
    work.isOnSale && work.discountPct ? `${formatDiscount(work.discountPct)} セール中` : null,
    (work.pointRate ?? 0) > 0 ? `${formatPointRate(work.pointRate)} 付き` : null,
    work.pastLowest != null && work.latestPrice != null && work.latestPrice <= work.pastLowest ? "過去最安水準" : null,
  ].filter(Boolean)
  const primaryReason = purchaseReasons.length ? purchaseReasons.join(" / ") : "価格監視中"

  return (
    <div className="page page-detail">
      <Link className="back-link" to="/">
        ← 一覧へ戻る
      </Link>

      <section className="detail-hero">
        <div className="detail-cover">
          <CoverImage alt={work.title} src={work.imageUrl} />
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

          <div className="detail-buy-box">
            <div className="detail-current-price">
              <span>現在価格</span>
              <strong>{formatYen(work.latestPrice)}</strong>
              <small>{describePriceBenefits(work.discountPct, work.pointRate)}</small>
            </div>
            <dl className="detail-status-grid">
              <div>
                <dt>実質価格</dt>
                <dd>{formatYen(work.effectivePrice)}</dd>
              </div>
              <div>
                <dt>販売状態</dt>
                <dd>{salesStatus}</dd>
              </div>
              <div>
                <dt>最終取得</dt>
                <dd>{formatUpdatedAt(work.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="detail-price-spotlight">
            <span>いま見る理由</span>
            <strong>{primaryReason}</strong>
            <small>{latestHistory ? `履歴最新 ${latestHistory.dateLabel}` : "価格履歴は次回収集待ち"}</small>
          </div>

          <dl className="price-panel">
            <div>
              <dt>定価</dt>
              <dd>{formatYen(work.listPrice)}</dd>
            </div>
            <div>
              <dt>過去最安</dt>
              <dd>{formatYen(work.pastLowest)}</dd>
            </div>
            <div>
              <dt>相場帯</dt>
              <dd>
                {formatYen(work.bandMin)} - {formatYen(work.bandMax)}
              </dd>
            </div>
            <div>
              <dt>よくある価格</dt>
              <dd>{formatYen(work.mode)}</dd>
            </div>
          </dl>

          <div className="detail-actions">
            {affiliateUrl ? (
              <a className="button button--primary" href={affiliateUrl} rel="noreferrer" target="_blank">
                この価格でDMMへ進む
              </a>
            ) : null}
            {tachiyomiUrl ? (
              <a className="button button--ghost" href={tachiyomiUrl} rel="noreferrer" target="_blank">
                試し読みへ
              </a>
            ) : null}
          </div>

          <div className="detail-links">
            <Link className="button button--ghost" to="/works">
              一覧へ戻る
            </Link>
            <span>一覧比較 → 理由確認 → DMMへ進む</span>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="detail-grid-main">
          <div className="detail-section-head">
            <div>
              <p className="section-eyebrow">History</p>
              <h2>価格履歴</h2>
            </div>
            <span>{work.history.length ? `${work.history.length}件` : "履歴なし"}</span>
          </div>
          {recentHistory.length ? (
            <div className="detail-history-strip">
              {recentHistory.map((point) => (
                <div key={point.capturedAt}>
                  <dt>{point.dateLabel}</dt>
                  <dd>{formatYen(point.price)}</dd>
                  <small>{formatYen(point.effectivePrice)} / {formatPointRate(point.pointRate)}</small>
                </div>
              ))}
            </div>
          ) : null}
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
            <p>この作品はまだ価格履歴がありません。次回以降の収集で履歴が増えるまで、最終更新と現在価格を目安にしてください。</p>
          )}
        </article>

        <article className="detail-grid-side">
          <div className="detail-section-head">
            <div>
              <p className="section-eyebrow">Meta</p>
              <h2>書誌情報</h2>
            </div>
          </div>
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

          <div className="detail-side-note">
            <p>{bandPosition} / {recentTrend} / {modeGap}</p>
          </div>
        </article>
      </section>
    </div>
  )
}
