import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

type SiteShellProps = {
  children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  const kinseriUrl = "https://yapi.ta2o.net/kndlsl/"

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand-lockup" to="/">
          <span className="brand-mark">d</span>
          <span>
            <strong>dmm-seli</strong>
            <small>DMM の価格は dmm-seli、Kindle は兄弟サイトのキンセリ</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="global">
          <NavLink to="/" end>
            追跡一覧
          </NavLink>
          <a href={kinseriUrl} target="_blank" rel="noreferrer">
            Kindle は兄弟サイトのキンセリ
          </a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
