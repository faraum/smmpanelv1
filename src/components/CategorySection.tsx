'use client'

import { Package } from '@/data/packages'
import ServiceCard from './ServiceCard'

interface CategorySectionProps {
  packages: Package[]
  onBuy: (pkg: Package) => void
}

export default function CategorySection({ packages, onBuy }: CategorySectionProps) {
  if (packages.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        Nenhum pacote disponível nesta categoria.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {packages.map((pkg) => (
        <ServiceCard key={pkg.id} pkg={pkg} onBuy={onBuy} />
      ))}
    </div>
  )
}
