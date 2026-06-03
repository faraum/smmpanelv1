import { NextResponse } from 'next/server'
import { getChargeStatus } from '@/lib/activepayments'
import { processOrderAfterPayment } from '@/lib/process-order'

// In-memory idempotency guard — prevents double-processing within the same instance
const processed = new Set<string>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { chargeId, orderData } = body

    if (!chargeId) {
      return NextResponse.json({ error: 'chargeId obrigatório' }, { status: 400 })
    }

    const hasKeys =
      process.env.ACTIVEPAYMENTS_PUBLIC_KEY && process.env.ACTIVEPAYMENTS_SECRET_KEY

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (!hasKeys || String(chargeId).startsWith('preview-')) {
      return NextResponse.json({ status: 'pending', preview: true })
    }

    // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
    const charge = await getChargeStatus(chargeId)

    if (charge.status === 'paid' && !processed.has(chargeId) && orderData) {
      processed.add(chargeId)

      console.log('💰 Pagamento confirmado! Criando pedido na BulkFollows...', {
        platform: orderData.platform,
        serviceType: orderData.serviceType,
        region: orderData.region,
        quantity: orderData.quantity,
        username: orderData.username,
        postLink: orderData.postLink,
      })

      const result = await processOrderAfterPayment({
        orderId: chargeId,
        platform: orderData.platform,
        serviceType: orderData.serviceType,
        region: orderData.region,
        quantity: orderData.quantity,
        username: orderData.username || '',
        instagramLink: orderData.postLink || orderData.instagramLink || '',
        comments: orderData.comments || undefined,
        orderBumps: orderData.orderBumps || [],
      })

      return NextResponse.json({
        status: 'paid',
        bulkOrderCreated: result.success,
        bulkOrderId: result.bulkOrderId,
        bulkError: result.error,
      })
    }

    return NextResponse.json({ status: charge.status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao consultar pagamento'
    console.error('Erro no check:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
