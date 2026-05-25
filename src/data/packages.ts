export interface Package {
  id: string
  category: string
  categorySlug: string
  name: string
  quantity: number
  priceBRL: number
  bulkServiceId: number
  inputType: 'profile' | 'post'
  description?: string
  popular?: boolean
}

export interface Category {
  name: string
  slug: string
  icon: string
  inputType: 'profile' | 'post'
}

export const categories: Category[] = [
  { name: 'Seguidores Mundiais',    slug: 'seguidores-mundiais',    icon: '🌍', inputType: 'profile' },
  { name: 'Seguidores Brasileiros', slug: 'seguidores-brasileiros', icon: '🇧🇷', inputType: 'profile' },
  { name: 'Curtidas Mundiais',      slug: 'curtidas-mundiais',      icon: '💖', inputType: 'post' },
  { name: 'Curtidas Brasileiras',   slug: 'curtidas-brasileiras',   icon: '🇧🇷', inputType: 'post' },
  { name: 'Visualizações Reels',    slug: 'visualizacoes-reels',    icon: '▶️', inputType: 'post' },
  { name: 'Comentários Brasileiros',slug: 'comentarios-brasileiros',icon: '💬', inputType: 'post' },
]

export const packages: Package[] = [
  // ── SEGUIDORES MUNDIAIS ──────────────────────────────────────────────────────
  { id: 'seg-m-500',   category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 500,   priceBRL: 12.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-1000',  category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 1000,  priceBRL: 17.90,  bulkServiceId: 0, inputType: 'profile', popular: true },
  { id: 'seg-m-2000',  category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 2000,  priceBRL: 32.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-3000',  category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 3000,  priceBRL: 44.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-5000',  category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 5000,  priceBRL: 84.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-10000', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 10000, priceBRL: 129.90, bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-20000', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 20000, priceBRL: 249.00, bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-30000', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 30000, priceBRL: 359.90, bulkServiceId: 0, inputType: 'profile' },

  // ── SEGUIDORES BRASILEIROS ───────────────────────────────────────────────────
  { id: 'seg-b-100',   category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 100,   priceBRL: 17.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-250',   category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 250,   priceBRL: 29.89,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-500',   category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 500,   priceBRL: 39.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-1000',  category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 1000,  priceBRL: 73.89,  bulkServiceId: 0, inputType: 'profile', popular: true },
  { id: 'seg-b-2000',  category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 2000,  priceBRL: 147.89, bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-3000',  category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 3000,  priceBRL: 220.99, bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-5000',  category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 5000,  priceBRL: 369.00, bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-10000', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 10000, priceBRL: 521.90, bulkServiceId: 0, inputType: 'profile' },

  // ── CURTIDAS MUNDIAIS ────────────────────────────────────────────────────────
  { id: 'cur-m-250',   category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 250,   priceBRL: 4.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-500',   category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 500,   priceBRL: 7.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-1000',  category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 1000,  priceBRL: 12.90, bulkServiceId: 0, inputType: 'post', popular: true },
  { id: 'cur-m-2200',  category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 2200,  priceBRL: 18.99, bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-3000',  category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 3000,  priceBRL: 24.99, bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-5000',  category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 5000,  priceBRL: 39.99, bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-10000', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 10000, priceBRL: 76.99, bulkServiceId: 0, inputType: 'post' },

  // ── CURTIDAS BRASILEIRAS ─────────────────────────────────────────────────────
  { id: 'cur-b-100',   category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 100,   priceBRL: 4.99,   bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-b-250',   category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 250,   priceBRL: 9.90,   bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-b-500',   category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 500,   priceBRL: 14.90,  bulkServiceId: 0, inputType: 'post', popular: true },
  { id: 'cur-b-1000',  category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 1000,  priceBRL: 21.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-b-2000',  category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 2000,  priceBRL: 42.00,  bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-b-5000',  category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 5000,  priceBRL: 108.00, bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-b-10000', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 10000, priceBRL: 199.00, bulkServiceId: 0, inputType: 'post' },

  // ── VISUALIZAÇÕES REELS ──────────────────────────────────────────────────────
  { id: 'vis-3000',    category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 3000,    priceBRL: 6.18,   bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-5000',    category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 5000,    priceBRL: 10.00,  bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-10000',   category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 10000,   priceBRL: 14.00,  bulkServiceId: 0, inputType: 'post', popular: true },
  { id: 'vis-20000',   category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 20000,   priceBRL: 25.00,  bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-50000',   category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 50000,   priceBRL: 35.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-100000',  category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 100000,  priceBRL: 55.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-500000',  category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 500000,  priceBRL: 99.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-1000000', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 1000000, priceBRL: 139.99, bulkServiceId: 0, inputType: 'post' },

  // ── COMENTÁRIOS BRASILEIROS ──────────────────────────────────────────────────
  { id: 'com-5',   category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 5,   priceBRL: 5.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'com-10',  category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 10,  priceBRL: 10.90, bulkServiceId: 0, inputType: 'post' },
  { id: 'com-20',  category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 20,  priceBRL: 20.90, bulkServiceId: 0, inputType: 'post', popular: true },
  { id: 'com-30',  category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 30,  priceBRL: 30.90, bulkServiceId: 0, inputType: 'post' },
  { id: 'com-50',  category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 50,  priceBRL: 44.90, bulkServiceId: 0, inputType: 'post' },
  { id: 'com-100', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 100, priceBRL: 79.90, bulkServiceId: 0, inputType: 'post' },
]

export function getPackagesBySlug(slug: string): Package[] {
  return packages.filter((p) => p.categorySlug === slug)
}

export function getPackageById(id: string): Package | undefined {
  return packages.find((p) => p.id === id)
}
