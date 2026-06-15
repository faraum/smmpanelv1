'use client'

import { useState } from 'react'
import { Package } from '@/data/packages'
import { formatBRL, formatNumber } from '@/lib/utils'
import { ShoppingCart, Star, Heart } from 'lucide-react'

interface ServiceCardProps {
  pkg: Package
  onBuy: (pkg: Package) => void
}

function getTypeIcon(slug: string): string {
  if (slug.startsWith('seguidores')) return '👥'
  if (slug.startsWith('curtidas')) return '❤️'
  if (slug.startsWith('visualizacoes')) return '▶️'
  return '⭐'
}

const INSTAGRAM_GRADIENT = 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'

export default function ServiceCard({ pkg, onBuy }: ServiceCardProps) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onBuy(pkg)
    }, 150)
  }

  const icon = getTypeIcon(pkg.categorySlug)
  const isFeatured = pkg.badge === 'popular' || pkg.badge === 'loved'
  const isLoved = pkg.badge === 'loved'

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:scale-[1.03] ${
        isFeatured
          ? isLoved
            ? 'border-pink-500/50 bg-gradient-to-b from-pink-950/30 to-[#12121a] shadow-lg shadow-pink-500/15 hover:shadow-pink-500/30'
            : 'border-purple-500/50 bg-gradient-to-b from-purple-950/40 to-[#12121a] shadow-lg shadow-purple-500/15 hover:shadow-purple-500/30'
          : 'border-white/5 bg-[#12121a] hover:border-white/15 hover:shadow-lg hover:shadow-purple-500/10'
      }`}
    >
      {/* Glow pulse for featured cards */}
      {isFeatured && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
          style={{
            boxShadow: isLoved
              ? '0 0 20px 3px rgba(236, 72, 153, 0.18)'
              : '0 0 20px 3px rgba(139, 92, 246, 0.2)',
          }}
        />
      )}

      {/* Discount badge — top left */}
      {pkg.discount && (
        <span
          className="absolute left-2 top-2 z-10 rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
          style={{ background: INSTAGRAM_GRADIENT }}
        >
          {pkg.discount}
        </span>
      )}

      {/* Featured badge — top center */}
      {pkg.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          {pkg.badge === 'popular' ? (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-purple-500/30">
              <Star className="h-3 w-3 fill-current" />
              Mais Popular
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-pink-500/30">
              <Heart className="h-3 w-3 fill-current" />
              Mais Queridinho
            </span>
          )}
        </div>
      )}

      <div className={`flex flex-col flex-1 p-3 sm:p-4 ${pkg.badge ? 'pt-5 sm:pt-6' : 'pt-3 sm:pt-4'}`}>
        {/* Type icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/5 text-lg sm:text-xl">
            {icon}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-1">
          <span className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
            {formatNumber(pkg.quantity)}
          </span>
        </div>

        {/* Name */}
        <p className="text-[11px] sm:text-xs text-gray-500 mb-3 leading-snug line-clamp-2">
          {pkg.name}
        </p>

        {/* Price + button */}
        <div className="mt-auto space-y-2.5">
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#10B981' }}>
            {formatBRL(pkg.priceBRL)}
          </p>

          <button
            onClick={handleBuy}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              isFeatured
                ? isLoved
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25 hover:shadow-pink-500/50 hover:from-pink-400 hover:to-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/50 hover:from-purple-400 hover:to-purple-600'
                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
            }`}
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
