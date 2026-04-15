import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import clsx from "clsx"

import type { CatalogWork, ViewDensity } from "../lib/catalog"
import { FLOOR_LABELS } from "../lib/catalog"
import { formatDiscount, formatPointRate, formatYen } from "../lib/format"

type WorkTileProps = {
  work: CatalogWork
  density?: ViewDensity | "rail"
}

export function WorkTile({ work, density = "wide" }: WorkTileProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={clsx("work-tile", `work-tile--${density}`)}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Link to={`/works/${encodeURIComponent(work.workId)}`}>
        <figure>
          <div className="work-cover">
            {work.imageUrl ? <img alt={work.title} loading="lazy" src={work.imageUrl} /> : <span>NO COVER</span>}
          </div>
          <figcaption>
            <div className="work-meta-row">
              <span className="pill">{FLOOR_LABELS[work.floor]}</span>
              {work.isOnSale ? <span className="pill pill--accent">{formatDiscount(work.discountPct)}</span> : null}
            </div>
            <h3>{work.title}</h3>
            <p className="work-credit">{work.maker ?? (work.authors.join(" / ") || "著者情報なし")}</p>
            <div className="work-price-block">
              <strong>{formatYen(work.currentPrice)}</strong>
              <small>{formatPointRate(work.pointRate)}</small>
              {work.listPrice && work.listPrice > (work.currentPrice ?? work.listPrice) ? (
                <em>{formatYen(work.listPrice)}</em>
              ) : null}
            </div>
          </figcaption>
        </figure>
      </Link>
    </motion.div>
  )
}
