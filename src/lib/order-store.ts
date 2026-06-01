/**
 * order-store.ts
 *
 * Encode/decode all order data inside the externalReference field sent to
 * ActivePayments. This removes the need for an in-memory store (which is
 * wiped on every Netlify cold-start) or a database.
 *
 * Format: base64url( JSON({ o, p, s, r, q, l, b }) )
 *   o = orderId
 *   p = platform  (ig | tk)
 *   s = serviceType (f | l | v | c)
 *   r = region  (g | b)
 *   q = quantity (number)
 *   l = instagramLink (URL)
 *   b = bumpQty (number)
 *
 * Max realistic size: ~170 chars — well within ActivePayments limits.
 */

export interface StoredOrderData {
  platform: string
  serviceType: string
  region: string
  quantity: number
  instagramLink: string
  bumpQty: number
}

// Abbreviation maps
const PLT:   Record<string, string> = { instagram: 'ig', tiktok: 'tk' }
const PLT_R: Record<string, string> = { ig: 'instagram', tk: 'tiktok' }
const SVC:   Record<string, string> = { followers: 'f', likes: 'l', views: 'v', comments: 'c' }
const SVC_R: Record<string, string> = { f: 'followers', l: 'likes', v: 'views', c: 'comments' }
const REG:   Record<string, string> = { global: 'g', brazil: 'b' }
const REG_R: Record<string, string> = { g: 'global', b: 'brazil' }

interface Payload {
  o: string  // orderId
  p: string  // platform abbr
  s: string  // serviceType abbr
  r: string  // region abbr
  q: number  // quantity
  l: string  // link
  b: number  // bumpQty
}

/** Encode all order data into a base64url string to use as externalReference */
export function buildExternalRef(
  orderId: string,
  platform: string,
  serviceType: string,
  region: string,
  quantity: number,
  instagramLink: string,
  bumpQty: number,
): string {
  const payload: Payload = {
    o: orderId,
    p: PLT[platform]   ?? 'ig',
    s: SVC[serviceType] ?? 'f',
    r: REG[region]     ?? 'g',
    q: quantity,
    l: instagramLink,
    b: bumpQty,
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

/** Decode the externalReference back into order data */
export function parseExternalRef(ref: string): {
  orderId: string
  platform: string
  serviceType: string
  region: string
  quantity: number
  instagramLink: string
  bumpQty: number
} | null {
  try {
    const json = Buffer.from(ref, 'base64url').toString('utf-8')
    const p: Payload = JSON.parse(json)

    if (!p.o || !p.l) return null  // minimum required fields

    return {
      orderId:      p.o,
      platform:     PLT_R[p.p] ?? 'instagram',
      serviceType:  SVC_R[p.s] ?? 'followers',
      region:       REG_R[p.r] ?? 'global',
      quantity:     Number(p.q) || 0,
      instagramLink: p.l,
      bumpQty:      Number(p.b) || 0,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Legacy in-memory store kept for the polling path (/api/payment/check)
// so that the checkout page still works while the PIX screen is open.
// This is now a secondary fallback only — the webhook uses parseExternalRef.
// ---------------------------------------------------------------------------
export const orderDataStore = new Map<string, StoredOrderData>()