import type { CatalogWork } from "../lib/catalog"
import { CoverImage } from "./CoverImage"

type HeroShelfProps = {
  works: CatalogWork[]
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size))
  }
  return result
}

export function HeroShelf({ works }: HeroShelfProps) {
  const covers = works.filter((work) => work.imageUrl).slice(0, 12)
  const rows = chunk(covers, 4)

  if (!covers.length) {
    return <div className="hero-shelf hero-shelf--empty">データ取得後に表紙がここへ並びます。</div>
  }

  return (
    <div className="hero-shelf" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div
          className={`hero-shelf-row ${rowIndex % 2 === 1 ? "hero-shelf-row--reverse" : ""}`}
          key={rowIndex}
        >
          {row.map((work) => (
            <CoverImage alt="" key={work.workId} src={work.imageUrl} />
          ))}
        </div>
      ))}
    </div>
  )
}
