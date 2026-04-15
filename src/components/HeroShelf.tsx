import type { CatalogWork } from "../lib/catalog"

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
    return <div className="hero-shelf hero-shelf--empty">DMM API から表紙取得後にここへ並びます。</div>
  }

  return (
    <div className="hero-shelf" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div
          className={`hero-shelf-row ${rowIndex % 2 === 1 ? "hero-shelf-row--reverse" : ""}`}
          key={rowIndex}
        >
          {row.map((work) => (
            <img key={work.workId} alt="" src={work.imageUrl ?? undefined} loading="lazy" />
          ))}
        </div>
      ))}
    </div>
  )
}
