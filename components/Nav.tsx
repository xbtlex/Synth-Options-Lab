'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Scanner' },
  { href: '/strikes', label: 'Strikes' },
  { href: '/strategy', label: 'Strategy' },
  { href: '/volatility', label: 'Volatility' },
  { href: '/distributions', label: 'Distribution' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="page-container" style={{ padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: '3rem' }}>
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: 'var(--cream)',
              textDecoration: 'none',
              textTransform: 'uppercase' as const,
            }}
          >
            {'>_'} SYNTH OPTIONS LAB
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '1.25rem', marginLeft: 'auto' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
