import { getBulkFollowsClient } from './bulkfollows'

// 1-hour in-memory cache to avoid hammering the BulkFollows API
let servicesCache: any[] | null = null
let cacheExpiry = 0

async function getServicesWithCache(): Promise<any[]> {
  if (servicesCache && Date.now() < cacheExpiry) return servicesCache
  const client = getBulkFollowsClient()
  servicesCache = await client.getServices()
  cacheExpiry = Date.now() + 60 * 60 * 1000
  return servicesCache!
}

const TYPE_KEYWORDS: Record<string, string[]> = {
  followers: ['follower', 'seguidor', 'seguidores'],
  likes:     ['like', 'curtida', 'heart'],
  views:     ['view', 'visualiza', 'watch'],
  comments:  ['comment', 'comentar'],
}

const BRAZIL_KEYWORDS = ['brazil', 'brazilian', 'brasil', 'br ', '🇧🇷']

export async function findCheapestService(params: {
  platform: 'instagram' | 'tiktok'
  type: 'followers' | 'likes' | 'views' | 'comments'
  region: 'global' | 'brazil'
  quantity: number
}): Promise<{ serviceId: number; rate: number; name: string } | null> {
  const services = await getServicesWithCache()

  const platformKw =
    params.platform === 'instagram'
      ? ['instagram', 'ig ', 'insta']
      : ['tiktok', 'tik tok']

  const typeKw = TYPE_KEYWORDS[params.type]

  const filter = (s: any, requireBrazil: boolean) => {
    const combined = `${s.name ?? ''} ${s.category ?? ''}`.toLowerCase()
    if (!platformKw.some((k) => combined.includes(k))) return false
    if (!typeKw.some((k) => combined.includes(k))) return false
    if (requireBrazil && !BRAZIL_KEYWORDS.some((k) => combined.includes(k))) return false
    const min = parseInt(s.min) || 0
    const max = parseInt(s.max) || 999_999_999
    return params.quantity >= min && params.quantity <= max
  }

  let matches = services.filter((s) => filter(s, params.region === 'brazil'))

  // Fallback: relax region requirement if no results
  if (matches.length === 0) {
    matches = services.filter((s) => filter(s, false))
  }

  if (matches.length === 0) return null

  matches.sort((a: any, b: any) => parseFloat(a.rate) - parseFloat(b.rate))
  const best = matches[0]

  return {
    serviceId: parseInt(best.service),
    rate: parseFloat(best.rate),
    name: best.name,
  }
}
