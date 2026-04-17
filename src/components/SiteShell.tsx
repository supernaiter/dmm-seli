import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

type SiteShellProps = {
  children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand-lockup" to="/">
          <span className="brand-mark">d</span>
          <span>
            <strong>dmm-seli</strong>
            <small>DMM電子書籍価格トラッカー</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="global">
          <NavLink to="/" end>
            追跡一覧
          </NavLink>
          <a href="https://yapi.ta2o.net/kndlsl/" target="_blank" rel="noreferrer">
            Kindleはキンセリ
          </a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
