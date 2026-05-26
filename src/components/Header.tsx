'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Zap } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
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
              <span style={{ color: '#8B5CF6' }}>Hype</span>
              <span style={{ color: '#ffffff' }}>fy</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#instagram"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Instagram
            </Link>
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
          <Link
            href="/#instagram"
            className="block text-sm text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Instagram
          </Link>
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
