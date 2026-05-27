/**
 * In-memory store for order data keyed by orderId.
 * Used to carry instagramLink and bumpQty from the generate endpoint
 * to the webhook (which only receives the short externalReference).
 *
 * Limitation: data is lost on server restart. The polling path (check route)
 * is the reliable fallback — it receives all params as query strings from
 * the checkout client.
 */

export interface StoredOrderData {
  platform: string
  serviceType: string
  region: string
  quantity: number
  instagramLink: string
  bumpQty: number
}

// Module-level singleton — shared across imports within the same server instance
export const orderDataStore = new Map<string, StoredOrderData>()

// Abbreviation helpers for compact externalReference

const PLT: Record<string, string> = { instagram: 'ig', tiktok: 'tk' }
const PLT_R: Record<string, string> = { ig: 'instagram', tk: 'tiktok' }

const SVC: Record<string, string> = { followers: 'f', likes: 'l', views: 'v', comments: 'c' }
const SVC_R: Record<string, string> = { f: 'followers', l: 'likes', v: 'views', c: 'comments' }

const REG: Record<string, string> = { global: 'g', brazil: 'b' }
const REG_R: Record<string, string> = { g: 'global', b: 'brazil' }

/** Build a compact externalReference: orderId|plt|svc|reg|qty  (always ≤ ~80 chars) */
export function buildExternalRef(
  orderId: string,
  platform: string,
  serviceType: string,
  region: string,
  quantity: number
): string {
  return [
    orderId,
    PLT[platform] ?? 'ig',
    SVC[serviceType] ?? 'f',
    REG[region] ?? 'g',
    String(quantity),
  ].join('|')
}

/** Parse a compact externalReference back into its parts */
export function parseExternalRef(ref: string): {
  orderId: string
  platform: string
  serviceType: string
  region: string
  quantity: number
} | null {
  const parts = ref.split('|')
  if (parts.length < 5) return null
  const [orderId, plt, svc, reg, qty] = parts
  return {
    orderId,
    platform: PLT_R[plt] ?? 'instagram',
    serviceType: SVC_R[svc] ?? 'followers',
    region: REG_R[reg] ?? 'global',
    quantity: parseInt(qty) || 0,
  }
}
