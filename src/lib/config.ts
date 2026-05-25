/**
 * Detecta modo de execução do painel.
 *
 * MODO PREVIEW — ativado quando NÃO existem as variáveis de ambiente
 *   → Sem banco, sem API, sem pagamento real
 *   → Dados fake para demonstração
 *   → Ideal para deploy de teste na Netlify sem configurar nada
 *
 * MODO PRODUÇÃO — ativado quando AMBAS as variáveis existem
 *   → MongoDB Atlas real
 *   → BulkFollows API real
 *   → PIX placeholder (para integrar gateway depois)
 */
export const isPreviewMode =
  !process.env.MONGODB_URI || !process.env.BULKFOLLOWS_API_KEY

/**
 * Formato do orderId em modo preview:
 *   preview_{packageId}_{timestamp}
 * Exemplo: preview_seg-m-1000_1748000000000
 *
 * Os packageIds usam somente hífens (-), então o separador underscore (_)
 * permite identificar o packageId sem ambiguidade.
 */
export function makePreviewOrderId(packageId: string): string {
  return `preview_${packageId}_${Date.now()}`
}

export function parsePreviewOrderId(
  orderId: string
): { packageId: string; timestamp: string } | null {
  if (!orderId.startsWith('preview_')) return null

  const withoutPrefix = orderId.slice('preview_'.length) // "seg-m-1000_1748000000000"
  const underscoreIdx = withoutPrefix.lastIndexOf('_')
  if (underscoreIdx === -1) return null

  const packageId = withoutPrefix.slice(0, underscoreIdx)  // "seg-m-1000"
  const timestamp = withoutPrefix.slice(underscoreIdx + 1) // "1748000000000"
  return { packageId, timestamp }
}

/** Pedidos fake para exibir no painel admin em modo preview */
export const FAKE_ORDERS = [
  { orderId: 'DEMO001', serviceName: '1.000 Seguidores Mundiais', instagramUser: '@mariasilva_br', quantity: 1000,  priceBRL: 17.90,  status: 'COMPLETED',       createdAt: new Date(Date.now() - 3_600_000).toISOString() },
  { orderId: 'DEMO002', serviceName: '500 Curtidas Brasileiras',  instagramUser: '@joaocosta_sp',  quantity: 500,   priceBRL: 14.90,  status: 'PROCESSING',       createdAt: new Date(Date.now() - 1_800_000).toISOString() },
  { orderId: 'DEMO003', serviceName: '10K Visualizações Reels',   instagramUser: '@bruna.foto',    quantity: 10000, priceBRL: 14.00,  status: 'PROCESSING',       createdAt: new Date(Date.now() - 900_000).toISOString() },
  { orderId: 'DEMO004', serviceName: '2.000 Seguidores Mundiais', instagramUser: '@lucas_games01', quantity: 2000,  priceBRL: 32.90,  status: 'PENDING_PAYMENT',  createdAt: new Date(Date.now() - 300_000).toISOString() },
  { orderId: 'DEMO005', serviceName: '250 Curtidas Mundiais',     instagramUser: '@ana.design',    quantity: 250,   priceBRL: 4.90,   status: 'COMPLETED',        createdAt: new Date(Date.now() - 7_200_000).toISOString() },
]
