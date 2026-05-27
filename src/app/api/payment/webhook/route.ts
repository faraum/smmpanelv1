import { NextResponse } from 'next/server'
import crypto from 'crypto'
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

      // externalReference format: orderId|platform|serviceType|region|quantity|instagramLink|bumpQty
      if (externalReference && externalReference.includes('|')) {
        const parts = (externalReference as string).split('|')
        // instagramLink may itself contain | if it somehow has query params — join remaining parts
        const [orderId, platform, serviceType, region, quantity, ...rest] = parts
        const bumpQty = rest.pop() ?? '0'
        const instagramLink = rest.join('|')

        const result = await processOrderAfterPayment({
          orderId,
          platform: platform as 'instagram' | 'tiktok',
          serviceType: serviceType as 'followers' | 'likes' | 'views' | 'comments',
          region: region as 'global' | 'brazil',
          quantity: parseInt(quantity) || 0,
          instagramLink,
          bumpQty: parseInt(bumpQty) || 0,
        })

        if (result.success) {
          console.log(`[Webhook] 🚀 BulkFollows pedido criado! id:${result.bulkOrderId}`)
        } else {
          console.error(`[Webhook] ❌ Falha BulkFollows: ${result.error}`)
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
