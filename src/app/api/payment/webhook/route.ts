import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { orderDataStore } from '@/lib/order-store'
import { processOrderAfterPayment } from '@/lib/process-order'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature')
    const webhookSecret = process.env.ACTIVEPAYMENTS_WEBHOOK_SECRET

    // Verificar assinatura HMAC se webhook secret configurado
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.warn('[Webhook] Rejeitado: assinatura inválida')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { event, data } = payload

    console.log(`[Webhook] Evento: ${event}`)

    if (event === 'charge.paid') {
      const { chargeId, externalReference, amount } = data
      console.log(
        `[Webhook] 💰 Pago! chargeId:${chargeId} ref:${externalReference} valor:R$${amount}`
      )

      if (externalReference) {
        const orderId = String(externalReference)

        // Look up full order data from in-memory store (set by generate route)
        const stored = orderDataStore.get(orderId)
        if (!stored?.instagramLink) {
          console.warn(`[Webhook] Dados não encontrados para orderId:${orderId} — polling será o fallback`)
        } else {
          const result = await processOrderAfterPayment({
            orderId,
            platform: stored.platform as 'instagram' | 'tiktok',
            serviceType: stored.serviceType as 'followers' | 'likes' | 'views' | 'comments',
            region: stored.region as 'global' | 'brazil',
            quantity: stored.quantity,
            instagramLink: stored.instagramLink,
            bumpQty: stored.bumpQty,
          })

          if (result.success) {
            console.log(`[Webhook] 🚀 BulkFollows pedido criado! id:${result.bulkOrderId}`)
            orderDataStore.delete(orderId) // cleanup
          } else {
            console.error(`[Webhook] ❌ Falha BulkFollows: ${result.error}`)
          }
        }
      }
    }

    if (event === 'charge.expired') {
      console.log(`[Webhook] ⏰ PIX expirado: ${data.chargeId}`)
    }

    if (event === 'charge.cancelled') {
      console.log(`[Webhook] ❌ Cancelado: ${data.chargeId}`)
    }

    // Sempre retornar 200 para evitar retry infinito
    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    console.error('[Webhook] Erro:', message)
    return NextResponse.json({ received: true }) // 200 mesmo com erro
  }
}
