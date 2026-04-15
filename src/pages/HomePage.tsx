import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { HeroShelf } from "../components/HeroShelf"
import { Section } from "../components/Section"
import { WorkTile } from "../components/WorkTile"
import type { TopPayload } from "../lib/catalog"
import { FLOOR_LABELS, FLOOR_ORDER } from "../lib/catalog"
import { loadTopPayload } from "../lib/data"
import { formatUpdatedAt } from "../lib/format"

export function HomePage() {
  const [payload, setPayload] = useState<TopPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "dmm-seli | DMM電子書籍速報"
    loadTopPayload().then(setPayload).catch((loadError: Error) => setError(loadError.message))
  }, [])

  const coverSource = payload
    ? [...payload.popular, ...payload.newReleases].filter(
        (work, index, works) => works.findIndex((candidate) => candidate.workId === work.workId) === index,
      )
    : []

  return (
    <div className="page page-home">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">DMM.com 電子書籍専用</p>
          <h1>dmm-seli</h1>
          <p className="hero-description">
            キンセリの感覚で、DMM.com の電子書籍を追うための別サービスです。コミック、文芸・ラノベ、ビジネス・実用、写真集を毎時更新します。
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/works">
              作品一覧へ
            </Link>
            <a className="button button--ghost" href="https://yapi.ta2o.net/kndlsl/" rel="noreferrer" target="_blank">
              Kindle はキンセリへ
            </a>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>最終更新</dt>
              <dd>{payload ? formatUpdatedAt(payload.updatedAt) : "読み込み中"}</dd>
            </div>
            <div>
              <dt>対象</dt>
              <dd>ebook 4フロア</dd>
            </div>
            <div>
              <dt>更新方式</dt>
              <dd>毎時の静的再生成</dd>
            </div>
          </dl>
        </div>
        <HeroShelf works={coverSource} />
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <Section
        eyebrow="Floor Guide"
        title="4フロアを、ひと目で切り替える。"
        description="DMM API が返す ebook 4フロアだけに絞り、キンセリ利用者が迷わない入口にしています。"
      >
        <div className="floor-grid">
          {FLOOR_ORDER.map((floor) => (
            <Link className="floor-link" key={floor} to={`/works?floor=${floor}`}>
              <strong>{FLOOR_LABELS[floor]}</strong>
              <span>{payload ? `${payload.floorCounts[floor]}件` : "読込中"}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Featured"
        title="注目セール"
        description="DMM API が価格差またはポイント還元を返した作品だけをここに出します。"
      >
        {payload && payload.featuredSales.length ? (
          <div className="rail-grid">
            {payload.featuredSales.slice(0, 8).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        ) : (
          <p className="empty-copy">
            現時点では、ebook 4フロアの上位取得分でセール判定に使える価格差・ポイント情報が返っていません。
          </p>
        )}
      </Section>

      <Section eyebrow="Popular" title="人気作品" description="`sort=rank` で取得した人気側の先頭から並べています。">
        {payload ? (
          <div className="rail-grid">
            {payload.popular.slice(0, 10).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        ) : (
          <p className="empty-copy">読み込み中です。</p>
        )}
      </Section>

      <Section eyebrow="Fresh" title="新着作品" description="`sort=date` の取得順をそのまま使い、配信の新しい順を優先します。">
        {payload ? (
          <div className="rail-grid">
            {payload.newReleases.slice(0, 10).map((work) => (
              <WorkTile density="rail" key={work.workId} work={work} />
            ))}
          </div>
        ) : (
          <p className="empty-copy">読み込み中です。</p>
        )}
      </Section>
    </div>
  )
}
