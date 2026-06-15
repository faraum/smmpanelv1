'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Zap } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handlePlatformNav = (platform: 'instagram' | 'tiktok') => {
    setMenuOpen(false)
    window.dispatchEvent(new CustomEvent('engajafy:platform', { detail: platform }))
    if (pathname !== '/') {
      router.push('/')
    }
    setTimeout(() => {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.5px' }}>
              <span style={{ color: '#8B5CF6' }}>Engaja</span>
              <span style={{ color: '#ffffff' }}>fy</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handlePlatformNav('instagram')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {/* Instagram icon */}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </button>
            <button
              onClick={() => handlePlatformNav('tiktok')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {/* TikTok icon */}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z" />
              </svg>
              TikTok
            </button>
            <Link
              href="/#faq"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              Suporte
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/90 px-4 py-4 space-y-3">
          <button
            onClick={() => handlePlatformNav('instagram')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </button>
          <button
            onClick={() => handlePlatformNav('tiktok')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z" />
            </svg>
            TikTok
          </button>
          <Link
            href="/#faq"
            className="block text-sm text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-500"
          >
            Suporte WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
