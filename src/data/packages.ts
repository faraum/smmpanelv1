// ── TEST MODE ─────────────────────────────────────────────────────────────────
// Mude para false para voltar ao comportamento normal de produção.
// Quando true: priceBRL = R$1,00 (display + cobrança real), quantidade enviada
// à BulkFollows = 100 (forçado no backend). Labels visuais não mudam.
export const TEST_MODE = true

// IMPORTANTE: Ao configurar bulkServiceId, SEMPRE escolher o serviço
// mais barato da BulkFollows para cada tipo:
// - Global/Mundial = cheapest service in category
// - Brasileiro/BR  = cheapest "Brazil/Brazilian" service in category
// Isso maximiza a margem de lucro em cada venda.

export interface Package {
  id: string
  category: string
  categorySlug: string
  name: string
  quantity: number
  priceBRL: number
  bulkServiceId: number
  inputType: 'profile' | 'post'
  platform?: 'instagram' | 'tiktok'
  description?: string
  popular?: boolean          // kept for backward compat
  badge?: 'popular' | 'loved'
  discount?: string
}

export interface Category {
  name: string
  slug: string
  icon: string
  inputType: 'profile' | 'post'
  platform?: 'instagram' | 'tiktok'
}

// ── SUB-CATEGORIES (used by tab bar) ──────────────────────────────────────────

export const instagramSubCategories: Category[] = [
  { name: 'Seguidores Mundiais',     slug: 'seguidores-mundiais',    icon: '🌍', inputType: 'profile', platform: 'instagram' },
  { name: 'Seguidores BR',           slug: 'seguidores-brasileiros', icon: '🇧🇷', inputType: 'profile', platform: 'instagram' },
  { name: 'Curtidas Mundiais',       slug: 'curtidas-mundiais',      icon: '💖', inputType: 'post',    platform: 'instagram' },
  { name: 'Curtidas BR',             slug: 'curtidas-brasileiras',   icon: '🇧🇷', inputType: 'post',    platform: 'instagram' },
  { name: 'Views Reels',             slug: 'visualizacoes-reels',    icon: '🎬', inputType: 'post',    platform: 'instagram' },
  { name: 'Views Stories',           slug: 'views-stories',          icon: '👁️', inputType: 'profile', platform: 'instagram' },
  { name: 'Comentários BR',          slug: 'comentarios-brasileiros',icon: '💬', inputType: 'post',    platform: 'instagram' },
  { name: 'Comentários Mundiais',    slug: 'comentarios-mundiais',   icon: '🌍', inputType: 'post',    platform: 'instagram' },
]

export const tiktokSubCategories: Category[] = [
  { name: 'Seguidores Global', slug: 'tiktok-seguidores-global', icon: '🌍', inputType: 'profile', platform: 'tiktok' },
  { name: 'Seguidores BR',     slug: 'tiktok-seguidores-br',     icon: '🇧🇷', inputType: 'profile', platform: 'tiktok' },
  { name: 'Curtidas Global',   slug: 'tiktok-curtidas-global',   icon: '❤️',  inputType: 'post',    platform: 'tiktok' },
  { name: 'Curtidas BR',       slug: 'tiktok-curtidas-br',       icon: '🇧🇷', inputType: 'post',    platform: 'tiktok' },
  { name: 'Views Global',      slug: 'tiktok-views-global',      icon: '▶️',  inputType: 'post',    platform: 'tiktok' },
  { name: 'Views BR',          slug: 'tiktok-views-br',          icon: '🇧🇷', inputType: 'post',    platform: 'tiktok' },
]

// Legacy alias — kept for backward compat
export const categories: Category[] = instagramSubCategories

// ── PACKAGES ─────────────────────────────────────────────────────────────────

const RAW_PACKAGES: Package[] = [

  // ══ INSTAGRAM ════════════════════════════════════════════════════════════════

  // ── Seguidores Mundiais ───────────────────────────────────────────────────
  { id: 'seg-m-100',   platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 100,   priceBRL: 1.00,   bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-500',   platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 500,   priceBRL: 12.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-m-1000',  platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 1000,  priceBRL: 17.90,  bulkServiceId: 0, inputType: 'profile', discount: '10% OFF' },
  { id: 'seg-m-2000',  platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 2000,  priceBRL: 32.90,  bulkServiceId: 0, inputType: 'profile', discount: '15% OFF' },
  { id: 'seg-m-3000',  platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 3000,  priceBRL: 44.90,  bulkServiceId: 0, inputType: 'profile', discount: '20% OFF', badge: 'popular', popular: true },
  { id: 'seg-m-5000',  platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 5000,  priceBRL: 84.90,  bulkServiceId: 0, inputType: 'profile', discount: '25% OFF' },
  { id: 'seg-m-10000', platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 10000, priceBRL: 129.90, bulkServiceId: 0, inputType: 'profile', discount: '35% OFF', badge: 'loved' },
  { id: 'seg-m-20000', platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 20000, priceBRL: 249.00, bulkServiceId: 0, inputType: 'profile', discount: '40% OFF' },
  { id: 'seg-m-30000', platform: 'instagram', category: 'Seguidores Mundiais', categorySlug: 'seguidores-mundiais', name: 'Seguidores Mundiais', quantity: 30000, priceBRL: 359.90, bulkServiceId: 0, inputType: 'profile', discount: '45% OFF' },

  // ── Seguidores Brasileiros ────────────────────────────────────────────────
  { id: 'seg-b-100',   platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 100,   priceBRL: 17.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'seg-b-250',   platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 250,   priceBRL: 29.89,  bulkServiceId: 0, inputType: 'profile', discount: '10% OFF' },
  { id: 'seg-b-500',   platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 500,   priceBRL: 39.90,  bulkServiceId: 0, inputType: 'profile', discount: '15% OFF' },
  { id: 'seg-b-1000',  platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 1000,  priceBRL: 73.89,  bulkServiceId: 0, inputType: 'profile', discount: '20% OFF' },
  { id: 'seg-b-2000',  platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 2000,  priceBRL: 147.89, bulkServiceId: 0, inputType: 'profile', discount: '25% OFF' },
  { id: 'seg-b-3000',  platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 3000,  priceBRL: 220.99, bulkServiceId: 0, inputType: 'profile', discount: '30% OFF', badge: 'popular', popular: true },
  { id: 'seg-b-5000',  platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 5000,  priceBRL: 369.00, bulkServiceId: 0, inputType: 'profile', discount: '35% OFF' },
  { id: 'seg-b-10000', platform: 'instagram', category: 'Seguidores Brasileiros', categorySlug: 'seguidores-brasileiros', name: 'Seguidores Brasileiros 🇧🇷', quantity: 10000, priceBRL: 521.90, bulkServiceId: 0, inputType: 'profile', discount: '40% OFF', badge: 'loved' },

  // ── Curtidas Mundiais ─────────────────────────────────────────────────────
  { id: 'cur-m-100',   platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 100,   priceBRL: 3.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-250',   platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 250,   priceBRL: 4.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-m-500',   platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 500,   priceBRL: 7.90,  bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'cur-m-1000',  platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 1000,  priceBRL: 12.90, bulkServiceId: 0, inputType: 'post', discount: '15% OFF' },
  { id: 'cur-m-2200',  platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 2200,  priceBRL: 18.99, bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'cur-m-3000',  platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 3000,  priceBRL: 24.99, bulkServiceId: 0, inputType: 'post', discount: '25% OFF', badge: 'popular', popular: true },
  { id: 'cur-m-5000',  platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 5000,  priceBRL: 39.99, bulkServiceId: 0, inputType: 'post', discount: '30% OFF' },
  { id: 'cur-m-10000', platform: 'instagram', category: 'Curtidas Mundiais', categorySlug: 'curtidas-mundiais', name: 'Curtidas Mundiais 💖🌎', quantity: 10000, priceBRL: 76.99, bulkServiceId: 0, inputType: 'post', discount: '35% OFF', badge: 'loved' },

  // ── Curtidas Brasileiras ──────────────────────────────────────────────────
  { id: 'cur-b-100',   platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 100,   priceBRL: 4.99,   bulkServiceId: 0, inputType: 'post' },
  { id: 'cur-b-250',   platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 250,   priceBRL: 9.90,   bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'cur-b-500',   platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 500,   priceBRL: 14.90,  bulkServiceId: 0, inputType: 'post', discount: '15% OFF' },
  { id: 'cur-b-1000',  platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 1000,  priceBRL: 21.90,  bulkServiceId: 0, inputType: 'post', discount: '20% OFF', badge: 'popular', popular: true },
  { id: 'cur-b-2000',  platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 2000,  priceBRL: 42.00,  bulkServiceId: 0, inputType: 'post', discount: '25% OFF' },
  { id: 'cur-b-5000',  platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 5000,  priceBRL: 108.00, bulkServiceId: 0, inputType: 'post', discount: '30% OFF' },
  { id: 'cur-b-10000', platform: 'instagram', category: 'Curtidas Brasileiras', categorySlug: 'curtidas-brasileiras', name: 'Curtidas Brasileiras 🇧🇷', quantity: 10000, priceBRL: 199.00, bulkServiceId: 0, inputType: 'post', discount: '35% OFF', badge: 'loved' },

  // ── Visualizações Reels ───────────────────────────────────────────────────
  { id: 'vis-1000',    platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 1000,    priceBRL: 4.90,   bulkServiceId: 0, inputType: 'post' },
  { id: 'vis-3000',    platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 3000,    priceBRL: 6.18,   bulkServiceId: 0, inputType: 'post', badge: 'popular', popular: true },
  { id: 'vis-5000',    platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 5000,    priceBRL: 10.00,  bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'vis-10000',   platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 10000,   priceBRL: 14.00,  bulkServiceId: 0, inputType: 'post', discount: '15% OFF', badge: 'loved' },
  { id: 'vis-20000',   platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 20000,   priceBRL: 25.00,  bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'vis-50000',   platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 50000,   priceBRL: 35.90,  bulkServiceId: 0, inputType: 'post', discount: '25% OFF' },
  { id: 'vis-100000',  platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 100000,  priceBRL: 55.90,  bulkServiceId: 0, inputType: 'post', discount: '30% OFF' },
  { id: 'vis-500000',  platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 500000,  priceBRL: 99.90,  bulkServiceId: 0, inputType: 'post', discount: '35% OFF' },
  { id: 'vis-1000000', platform: 'instagram', category: 'Visualizações Reels', categorySlug: 'visualizacoes-reels', name: 'Visualizações Reels', quantity: 1000000, priceBRL: 139.99, bulkServiceId: 0, inputType: 'post', discount: '40% OFF' },

  // ── Views Stories (NOVO) ──────────────────────────────────────────────────
  { id: 'sto-100',   platform: 'instagram', category: 'Views Stories', categorySlug: 'views-stories', name: 'Views Stories Instagram 👁️', quantity: 100,   priceBRL: 4.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'sto-500',   platform: 'instagram', category: 'Views Stories', categorySlug: 'views-stories', name: 'Views Stories Instagram 👁️', quantity: 500,   priceBRL: 9.90,  bulkServiceId: 0, inputType: 'profile', discount: '10% OFF' },
  { id: 'sto-1000',  platform: 'instagram', category: 'Views Stories', categorySlug: 'views-stories', name: 'Views Stories Instagram 👁️', quantity: 1000,  priceBRL: 14.90, bulkServiceId: 0, inputType: 'profile', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'sto-2000',  platform: 'instagram', category: 'Views Stories', categorySlug: 'views-stories', name: 'Views Stories Instagram 👁️', quantity: 2000,  priceBRL: 24.90, bulkServiceId: 0, inputType: 'profile', discount: '20% OFF' },
  { id: 'sto-5000',  platform: 'instagram', category: 'Views Stories', categorySlug: 'views-stories', name: 'Views Stories Instagram 👁️', quantity: 5000,  priceBRL: 49.90, bulkServiceId: 0, inputType: 'profile', discount: '25% OFF' },
  { id: 'sto-10000', platform: 'instagram', category: 'Views Stories', categorySlug: 'views-stories', name: 'Views Stories Instagram 👁️', quantity: 10000, priceBRL: 89.90, bulkServiceId: 0, inputType: 'profile', discount: '35% OFF', badge: 'loved' },

  // ── Comentários Brasileiros ───────────────────────────────────────────────
  { id: 'com-5',   platform: 'instagram', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 5,   priceBRL: 5.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'com-10',  platform: 'instagram', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 10,  priceBRL: 10.90, bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'com-20',  platform: 'instagram', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 20,  priceBRL: 20.90, bulkServiceId: 0, inputType: 'post', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'com-30',  platform: 'instagram', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 30,  priceBRL: 30.90, bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'com-50',  platform: 'instagram', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 50,  priceBRL: 44.90, bulkServiceId: 0, inputType: 'post', discount: '25% OFF' },
  { id: 'com-100', platform: 'instagram', category: 'Comentários Brasileiros', categorySlug: 'comentarios-brasileiros', name: 'Comentários Brasileiros', quantity: 100, priceBRL: 79.90, bulkServiceId: 0, inputType: 'post', discount: '30% OFF', badge: 'loved' },

  // ── Comentários Mundiais ──────────────────────────────────────────────────
  { id: 'com-g-5',   platform: 'instagram', category: 'Comentários Mundiais', categorySlug: 'comentarios-mundiais', name: 'Comentários Mundiais', quantity: 5,   priceBRL: 4.90,  bulkServiceId: 476, inputType: 'post' },
  { id: 'com-g-10',  platform: 'instagram', category: 'Comentários Mundiais', categorySlug: 'comentarios-mundiais', name: 'Comentários Mundiais', quantity: 10,  priceBRL: 8.90,  bulkServiceId: 476, inputType: 'post', discount: '10% OFF' },
  { id: 'com-g-20',  platform: 'instagram', category: 'Comentários Mundiais', categorySlug: 'comentarios-mundiais', name: 'Comentários Mundiais', quantity: 20,  priceBRL: 16.90, bulkServiceId: 476, inputType: 'post', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'com-g-30',  platform: 'instagram', category: 'Comentários Mundiais', categorySlug: 'comentarios-mundiais', name: 'Comentários Mundiais', quantity: 30,  priceBRL: 24.90, bulkServiceId: 476, inputType: 'post', discount: '20% OFF' },
  { id: 'com-g-50',  platform: 'instagram', category: 'Comentários Mundiais', categorySlug: 'comentarios-mundiais', name: 'Comentários Mundiais', quantity: 50,  priceBRL: 39.90, bulkServiceId: 476, inputType: 'post', discount: '25% OFF' },
  { id: 'com-g-100', platform: 'instagram', category: 'Comentários Mundiais', categorySlug: 'comentarios-mundiais', name: 'Comentários Mundiais', quantity: 100, priceBRL: 69.90, bulkServiceId: 476, inputType: 'post', discount: '30% OFF', badge: 'loved' },

  // ══ TIKTOK ════════════════════════════════════════════════════════════════════

  // ── TikTok Seguidores Global ──────────────────────────────────────────────
  { id: 'tk-seg-g-100',   platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 100,   priceBRL: 9.90,   bulkServiceId: 0, inputType: 'profile' },
  { id: 'tk-seg-g-500',   platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 500,   priceBRL: 14.90,  bulkServiceId: 0, inputType: 'profile', discount: '10% OFF' },
  { id: 'tk-seg-g-1000',  platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 1000,  priceBRL: 24.90,  bulkServiceId: 0, inputType: 'profile', discount: '15% OFF' },
  { id: 'tk-seg-g-2000',  platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 2000,  priceBRL: 44.90,  bulkServiceId: 0, inputType: 'profile', discount: '20% OFF' },
  { id: 'tk-seg-g-3000',  platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 3000,  priceBRL: 64.90,  bulkServiceId: 0, inputType: 'profile', discount: '25% OFF', badge: 'popular', popular: true },
  { id: 'tk-seg-g-5000',  platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 5000,  priceBRL: 99.90,  bulkServiceId: 0, inputType: 'profile', discount: '30% OFF' },
  { id: 'tk-seg-g-10000', platform: 'tiktok', category: 'TikTok Seguidores Global', categorySlug: 'tiktok-seguidores-global', name: 'Seguidores TikTok 🌍', quantity: 10000, priceBRL: 179.90, bulkServiceId: 0, inputType: 'profile', discount: '35% OFF', badge: 'loved' },

  // ── TikTok Seguidores BR ──────────────────────────────────────────────────
  { id: 'tk-seg-b-100',  platform: 'tiktok', category: 'TikTok Seguidores BR', categorySlug: 'tiktok-seguidores-br', name: 'Seguidores TikTok 🇧🇷', quantity: 100,  priceBRL: 19.90,  bulkServiceId: 0, inputType: 'profile' },
  { id: 'tk-seg-b-250',  platform: 'tiktok', category: 'TikTok Seguidores BR', categorySlug: 'tiktok-seguidores-br', name: 'Seguidores TikTok 🇧🇷', quantity: 250,  priceBRL: 34.90,  bulkServiceId: 0, inputType: 'profile', discount: '10% OFF' },
  { id: 'tk-seg-b-500',  platform: 'tiktok', category: 'TikTok Seguidores BR', categorySlug: 'tiktok-seguidores-br', name: 'Seguidores TikTok 🇧🇷', quantity: 500,  priceBRL: 59.90,  bulkServiceId: 0, inputType: 'profile', discount: '15% OFF' },
  { id: 'tk-seg-b-1000', platform: 'tiktok', category: 'TikTok Seguidores BR', categorySlug: 'tiktok-seguidores-br', name: 'Seguidores TikTok 🇧🇷', quantity: 1000, priceBRL: 99.90,  bulkServiceId: 0, inputType: 'profile', discount: '20% OFF', badge: 'popular', popular: true },
  { id: 'tk-seg-b-2000', platform: 'tiktok', category: 'TikTok Seguidores BR', categorySlug: 'tiktok-seguidores-br', name: 'Seguidores TikTok 🇧🇷', quantity: 2000, priceBRL: 179.90, bulkServiceId: 0, inputType: 'profile', discount: '25% OFF' },
  { id: 'tk-seg-b-5000', platform: 'tiktok', category: 'TikTok Seguidores BR', categorySlug: 'tiktok-seguidores-br', name: 'Seguidores TikTok 🇧🇷', quantity: 5000, priceBRL: 399.90, bulkServiceId: 0, inputType: 'profile', discount: '30% OFF', badge: 'loved' },

  // ── TikTok Curtidas Global ────────────────────────────────────────────────
  { id: 'tk-cur-g-100',  platform: 'tiktok', category: 'TikTok Curtidas Global', categorySlug: 'tiktok-curtidas-global', name: 'Curtidas TikTok 🌍', quantity: 100,  priceBRL: 4.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'tk-cur-g-250',  platform: 'tiktok', category: 'TikTok Curtidas Global', categorySlug: 'tiktok-curtidas-global', name: 'Curtidas TikTok 🌍', quantity: 250,  priceBRL: 7.90,  bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'tk-cur-g-500',  platform: 'tiktok', category: 'TikTok Curtidas Global', categorySlug: 'tiktok-curtidas-global', name: 'Curtidas TikTok 🌍', quantity: 500,  priceBRL: 12.90, bulkServiceId: 0, inputType: 'post', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'tk-cur-g-1000', platform: 'tiktok', category: 'TikTok Curtidas Global', categorySlug: 'tiktok-curtidas-global', name: 'Curtidas TikTok 🌍', quantity: 1000, priceBRL: 19.90, bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'tk-cur-g-2000', platform: 'tiktok', category: 'TikTok Curtidas Global', categorySlug: 'tiktok-curtidas-global', name: 'Curtidas TikTok 🌍', quantity: 2000, priceBRL: 34.90, bulkServiceId: 0, inputType: 'post', discount: '25% OFF' },
  { id: 'tk-cur-g-5000', platform: 'tiktok', category: 'TikTok Curtidas Global', categorySlug: 'tiktok-curtidas-global', name: 'Curtidas TikTok 🌍', quantity: 5000, priceBRL: 79.90, bulkServiceId: 0, inputType: 'post', discount: '30% OFF', badge: 'loved' },

  // ── TikTok Curtidas BR ────────────────────────────────────────────────────
  { id: 'tk-cur-b-100',  platform: 'tiktok', category: 'TikTok Curtidas BR', categorySlug: 'tiktok-curtidas-br', name: 'Curtidas TikTok 🇧🇷', quantity: 100,  priceBRL: 9.90,  bulkServiceId: 0, inputType: 'post' },
  { id: 'tk-cur-b-250',  platform: 'tiktok', category: 'TikTok Curtidas BR', categorySlug: 'tiktok-curtidas-br', name: 'Curtidas TikTok 🇧🇷', quantity: 250,  priceBRL: 17.90, bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'tk-cur-b-500',  platform: 'tiktok', category: 'TikTok Curtidas BR', categorySlug: 'tiktok-curtidas-br', name: 'Curtidas TikTok 🇧🇷', quantity: 500,  priceBRL: 29.90, bulkServiceId: 0, inputType: 'post', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'tk-cur-b-1000', platform: 'tiktok', category: 'TikTok Curtidas BR', categorySlug: 'tiktok-curtidas-br', name: 'Curtidas TikTok 🇧🇷', quantity: 1000, priceBRL: 49.90, bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'tk-cur-b-2000', platform: 'tiktok', category: 'TikTok Curtidas BR', categorySlug: 'tiktok-curtidas-br', name: 'Curtidas TikTok 🇧🇷', quantity: 2000, priceBRL: 89.90, bulkServiceId: 0, inputType: 'post', discount: '25% OFF', badge: 'loved' },

  // ── TikTok Visualizações Global ───────────────────────────────────────────
  { id: 'tk-vis-g-1000',   platform: 'tiktok', category: 'TikTok Views Global', categorySlug: 'tiktok-views-global', name: 'Views TikTok 🌍', quantity: 1000,   priceBRL: 4.90,   bulkServiceId: 0, inputType: 'post' },
  { id: 'tk-vis-g-5000',   platform: 'tiktok', category: 'TikTok Views Global', categorySlug: 'tiktok-views-global', name: 'Views TikTok 🌍', quantity: 5000,   priceBRL: 9.90,   bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'tk-vis-g-10000',  platform: 'tiktok', category: 'TikTok Views Global', categorySlug: 'tiktok-views-global', name: 'Views TikTok 🌍', quantity: 10000,  priceBRL: 14.90,  bulkServiceId: 0, inputType: 'post', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'tk-vis-g-50000',  platform: 'tiktok', category: 'TikTok Views Global', categorySlug: 'tiktok-views-global', name: 'Views TikTok 🌍', quantity: 50000,  priceBRL: 34.90,  bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'tk-vis-g-100000', platform: 'tiktok', category: 'TikTok Views Global', categorySlug: 'tiktok-views-global', name: 'Views TikTok 🌍', quantity: 100000, priceBRL: 59.90,  bulkServiceId: 0, inputType: 'post', discount: '25% OFF', badge: 'loved' },
  { id: 'tk-vis-g-500000', platform: 'tiktok', category: 'TikTok Views Global', categorySlug: 'tiktok-views-global', name: 'Views TikTok 🌍', quantity: 500000, priceBRL: 119.90, bulkServiceId: 0, inputType: 'post', discount: '30% OFF' },

  // ── TikTok Visualizações BR ───────────────────────────────────────────────
  { id: 'tk-vis-b-1000',   platform: 'tiktok', category: 'TikTok Views BR', categorySlug: 'tiktok-views-br', name: 'Views TikTok 🇧🇷', quantity: 1000,   priceBRL: 9.90,   bulkServiceId: 0, inputType: 'post' },
  { id: 'tk-vis-b-5000',   platform: 'tiktok', category: 'TikTok Views BR', categorySlug: 'tiktok-views-br', name: 'Views TikTok 🇧🇷', quantity: 5000,   priceBRL: 19.90,  bulkServiceId: 0, inputType: 'post', discount: '10% OFF' },
  { id: 'tk-vis-b-10000',  platform: 'tiktok', category: 'TikTok Views BR', categorySlug: 'tiktok-views-br', name: 'Views TikTok 🇧🇷', quantity: 10000,  priceBRL: 34.90,  bulkServiceId: 0, inputType: 'post', discount: '15% OFF', badge: 'popular', popular: true },
  { id: 'tk-vis-b-50000',  platform: 'tiktok', category: 'TikTok Views BR', categorySlug: 'tiktok-views-br', name: 'Views TikTok 🇧🇷', quantity: 50000,  priceBRL: 79.90,  bulkServiceId: 0, inputType: 'post', discount: '20% OFF' },
  { id: 'tk-vis-b-100000', platform: 'tiktok', category: 'TikTok Views BR', categorySlug: 'tiktok-views-br', name: 'Views TikTok 🇧🇷', quantity: 100000, priceBRL: 139.90, bulkServiceId: 0, inputType: 'post', discount: '25% OFF', badge: 'loved' },
]

// Quando TEST_MODE: só sobrescreve o preço. Quantidade e nome ficam intactos
// para o cliente ver os labels normais (ex: "1.000 seguidores"). A quantidade
// real enviada à BulkFollows é forçada a 100 no backend (generate/route.ts).
export const packages: Package[] = RAW_PACKAGES.map(pkg =>
  TEST_MODE ? { ...pkg, priceBRL: 1.00 } : pkg
)

export function getPackagesBySlug(slug: string): Package[] {
  return packages.filter((p) => p.categorySlug === slug)
}

export function getPackageById(id: string): Package | undefined {
  return packages.find((p) => p.id === id)
}
