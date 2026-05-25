'use client'

import { useState } from 'react'
import { Package } from '@/data/packages'
import { formatBRL, formatQuantity } from '@/lib/utils'
import { ShoppingCart, Star, Zap } from 'lucide-react'

interface ServiceCardProps {
  pkg: Package
  onBuy: (pkg: Package) => void
}

function getTypeIcon(slug: string): string {
  if (slug.startsWith('seguidores')) return '👥'
  if (slug.startsWith('curtidas')) return '❤️'
  if (slug.startsWith('visualizacoes')) return '▶️'
  if (slug.startsWith('comentarios')) return '💬'
  return '⭐'
}

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

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:scale-[1.025] hover:shadow-xl ${
        pkg.popular
          ? 'border-purple-500/50 bg-gradient-to-b from-purple-950/40 to-[#12121a] shadow-purple-500/10 shadow-lg'
          : 'border-white/5 bg-[#12121a] hover:border-white/10'
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-purple-500/30 whitespace-nowrap">
            <Star className="h-3 w-3 fill-current" />
            Mais Popular
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl">
            {icon}
          </div>
          {pkg.popular && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold">Hot</span>
            </div>
          )}
        </div>

        <div className="mb-1">
          <span className="text-3xl font-black text-white leading-none tracking-tight">
            {formatQuantity(pkg.quantity)}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-4 leading-snug line-clamp-2">{pkg.name}</p>

        <div className="mt-auto space-y-3">
          <p className="text-2xl font-bold text-white">{formatBRL(pkg.priceBRL)}</p>

          <button
            onClick={handleBuy}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              pkg.popular
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 hover:from-purple-400 hover:to-purple-600'
                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
            }`}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
