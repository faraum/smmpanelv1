import { NextResponse } from 'next/server'
import { getChargeStatus } from '@/lib/activepayments'
import { processOrderAfterPayment } from '@/lib/process-order'

// In-memory idempotency guard — prevents double-processing within the same instance
const processedCharges = new Set<string>()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const chargeId = searchParams.get('chargeId')

    // Order data (passed by the checkout polling so we can dispatch BulkFollows)
    const orderId       = searchParams.get('orderId')
    const platform      = searchParams.get('platform')
    const serviceType   = searchParams.get('serviceType')
    const region        = searchParams.get('region')
    const quantity      = searchParams.get('quantity')
    const instagramLink = searchParams.get('instagramLink')
    const bumpQty       = searchParams.get('bumpQty')

    if (!chargeId) {
      return NextResponse.json({ error: 'chargeId obrigatório' }, { status: 400 })
    }

    const hasPaymentKeys =
      process.env.ACTIVEPAYMENTS_PUBLIC_KEY && process.env.ACTIVEPAYMENTS_SECRET_KEY

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (!hasPaymentKeys || chargeId.startsWith('preview-')) {
      return NextResponse.json({ chargeId, status: 'pending', preview: true })
    }

    // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
    const charge = await getChargeStatus(chargeId)

    // If paid and not yet processed by this polling path → dispatch BulkFollows
    if (
      charge.status === 'paid' &&
      !processedCharges.has(chargeId) &&
      orderId && platform && serviceType && region && quantity && instagramLink
    ) {
      processedCharges.add(chargeId)

      const result = await processOrderAfterPayment({
        orderId,
        platform: platform as 'instagram' | 'tiktok',
        serviceType: serviceType as 'followers' | 'likes' | 'views' | 'comments',
        region: region as 'global' | 'brazil',
        quantity: parseInt(quantity),
        instagramLink,
        bumpQty: parseInt(bumpQty || '0'),
      })

      return NextResponse.json({
        chargeId: charge.chargeId,
        status: charge.status,
        paidAt: charge.paidAt || null,
        bulkOrderCreated: result.success,
        bulkOrderId: result.bulkOrderId,
      })
    }

    return NextResponse.json({
      chargeId: charge.chargeId,
      status: charge.status,
      paidAt: charge.paidAt || null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao consultar pagamento'
    console.error('Erro ao consultar status:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
