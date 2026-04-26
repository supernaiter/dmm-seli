import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import clsx from "clsx"

import type { CatalogWork, ViewDensity } from "../lib/catalog"
import { FLOOR_LABELS } from "../lib/catalog"
import { formatDiscount, formatPointRate, formatUpdatedAt, formatYen } from "../lib/format"
import { CoverImage } from "./CoverImage"

type WorkTileProps = {
  work: CatalogWork
  density?: ViewDensity | "rail"
}

export function WorkTile({ work, density = "wide" }: WorkTileProps) {
  const reduceMotion = useReducedMotion()
  const ctaCopy = work.isOnSale
    ? "セール理由を見てDMMへ"
    : (work.pointRate ?? 0) > 0
      ? "還元込みでDMMを見る"
      : "詳細で価格を確認"

  return (
    <motion.div
      className={clsx("work-tile", `work-tile--${density}`)}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Link to={`/works/${encodeURIComponent(work.workId)}`}>
        <figure>
          <div className="work-cover">
            <CoverImage alt={work.title} src={work.imageUrl} />
          </div>
          <figcaption>
            <div className="work-meta-row">
              <span className="pill">{FLOOR_LABELS[work.floor]}</span>
              {work.badge ? <span className="pill pill--badge">{work.badge}</span> : null}
              {work.isOnSale ? <span className="pill pill--accent">{formatDiscount(work.discountPct)}</span> : null}
            </div>
            <h3>{work.title}</h3>
            <p className="work-credit">
              {work.authors.join(" / ") || "著者情報なし"}
              {work.series ? ` ・ ${work.series}` : ""}
            </p>
            <div className="work-price-block">
              <strong>{formatYen(work.latestPrice)}</strong>
              <small>{formatPointRate(work.pointRate)}</small>
              {work.listPrice && work.listPrice > (work.latestPrice ?? work.listPrice) ? (
                <em>{formatYen(work.listPrice)}</em>
              ) : null}
            </div>
            <dl className="work-stats">
              <div>
                <dt>実質</dt>
                <dd>{formatYen(work.effectivePrice)}</dd>
              </div>
              <div>
                <dt>過去最安</dt>
                <dd>{formatYen(work.pastLowest)}</dd>
              </div>
            </dl>
            <div className="work-cta-row">
              <span>{ctaCopy}</span>
              <strong>→</strong>
            </div>
            <p className="work-updated">{formatUpdatedAt(work.lastCapturedAt)}</p>
          </figcaption>
        </figure>
      </Link>
    </motion.div>
  )
}
