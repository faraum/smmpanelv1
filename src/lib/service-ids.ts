// IDs FIXOS dos serviços na BulkFollows
// NUNCA buscar por nome. SEMPRE usar estes IDs.

export const BULK_SERVICE_IDS: Record<string, Record<string, Record<string, number>>> = {
  instagram: {
    followers: { global: 14805, brazil: 8695 },
    likes:     { global: 3319,  brazil: 14388 },
    views:     { global: 4494,  brazil: 4494 },
    comments:  { global: 476,   brazil: 8701 },
  },
  tiktok: {
    followers: { global: 13764, brazil: 13090 },
    likes:     { global: 14747, brazil: 13458 },
    views:     { global: 4293,  brazil: 9460 },
  },
}

export function getServiceId(platform: string, serviceType: string, region: string): number | null {
  const p = BULK_SERVICE_IDS[platform]
  if (!p) return null
  const t = p[serviceType]
  if (!t) return null
  return t[region] || null
}
