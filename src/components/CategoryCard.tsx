'use client'

import { Category, Package } from '@/data/packages'
import { formatBRL } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  packages: Package[]
  featured?: boolean
  active?: boolean
  onClick: () => void
}

const CATEGORY_FEATURES: Record<string, string[]> = {
  'seguidores-mundiais':       ['Entrega em até 1h', 'Alta retenção', 'Sem senha'],
  'seguidores-brasileiros':    ['Perfis BR reais', 'Engajamento qualificado', 'Alta retenção'],
  'curtidas-mundiais':         ['Entrega imediata', 'Qualidade premium', 'Sem senha'],
  'curtidas-brasileiras':      ['Curtidas de BR reais', 'Mais engajamento', 'Entrega rápida'],
  'visualizacoes-reels':       ['Boost no algoritmo', 'Views reais', 'Entrega rápida'],
  'views-stories':             ['Aumento de alcance', 'Entrega rápida', 'Sem senha'],
  'tiktok-seguidores-global':  ['Entrega em até 1h', 'Alta retenção', 'Sem senha'],
  'tiktok-seguidores-br':      ['Perfis BR reais', 'Engajamento qualificado', 'Alta retenção'],
  'tiktok-curtidas-global':    ['Entrega imediata', 'Qualidade premium', 'Sem senha'],
  'tiktok-curtidas-br':        ['Curtidas de BR reais', 'Mais engajamento', 'Entrega rápida'],
  'tiktok-views-global':       ['Boost no algoritmo', 'Views reais', 'Entrega rápida'],
  'tiktok-views-br':           ['Views de contas BR', 'Mais alcance', 'Entrega rápida'],
}

export default function CategoryCard({ category, packages, featured, active, onClick }: CategoryCardProps) {
  const minPrice = packages.length > 0 ? Math.min(...packages.map((p) => p.priceBRL)) : 0
  const features = CATEGORY_FEATURES[category.slug] ?? ['Entrega rápida', 'Qualidade premium', 'Sem senha']
  const isTikTok = category.platform === 'tiktok'

  return (
    <div
      className={`relative flex-shrink-0 w-52 sm:w-auto rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] select-none ${
        active
          ? isTikTok
            ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-red-500/5'
            : 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-purple-700/5'
          : featured
          ? isTikTok
            ? 'border-pink-500/30 bg-gradient-to-br from-pink-500/8 to-red-500/3'
            : 'border-purple-500/30 bg-gradient-to-br from-purple-500/8 to-purple-700/3'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
      onClick={onClick}
    >
      {featured && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-bold text-white shadow-lg ${
            isTikTok
              ? 'bg-gradient-to-r from-pink-500 to-red-500'
              : 'bg-gradient-to-r from-purple-500 to-purple-700'
          }`}>
            ⭐ Mais Popular
          </span>
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-3 mt-1">
        <span className="text-2xl">{category.icon}</span>
        <div>
          <h3 className="font-bold text-white text-xs leading-tight">{category.name}</h3>
          <p className="text-[10px] text-gray-500">{packages.length} pacotes</p>
        </div>
      </div>

      <ul className="space-y-1 mb-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="text-green-400 text-[10px]">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-auto">
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-wide">A partir de</p>
          <p className="text-sm font-bold" style={{ color: '#10B981' }}>{formatBRL(minPrice)}</p>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold text-white ${
          isTikTok
            ? 'bg-gradient-to-r from-pink-500 to-red-500'
            : 'bg-gradient-to-r from-purple-500 to-purple-700'
        }`}>
          Ver
        </span>
      </div>
    </div>
  )
}
