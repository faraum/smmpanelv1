import { NextResponse } from 'next/server'
import crypto from 'crypto'

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
        console.warn('Webhook rejeitado: assinatura inválida')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { event, data } = payload

    console.log(`[Webhook] Evento recebido: ${event}`, data)

    if (event === 'charge.paid') {
      const { chargeId, externalReference, amount } = data
      console.log(
        `[Webhook] ✅ PAGAMENTO CONFIRMADO! ChargeId: ${chargeId}, OrderId: ${externalReference}, Valor: R$ ${amount}`
      )

      // TODO: quando MongoDB estiver configurado, descomentar:
      // const { connectDB } = await import('@/lib/mongodb')
      // const { default: Order } = await import('@/lib/models/Order')
      // const { getBulkFollowsClient } = await import('@/lib/bulkfollows')
      // await connectDB()
      // const order = await Order.findOne({ orderId: externalReference })
      // if (order && order.status === 'PENDING_PAYMENT') {
      //   order.status = 'PAID'
      //   order.paidAt = new Date()
      //   await order.save()
      //   const client = getBulkFollowsClient()
      //   const bulkResult = await client.createOrder(order.serviceId, order.instagramLink, order.quantity)
      //   order.bulkOrderId = bulkResult.order
      //   order.status = 'PROCESSING'
      //   await order.save()
      // }
    }

    if (event === 'charge.expired') {
      console.log(`[Webhook] ⏰ PIX expirado: ${data.chargeId}`)
    }

    if (event === 'charge.cancelled') {
      console.log(`[Webhook] ❌ Cobrança cancelada: ${data.chargeId}`)
    }

    // Retornar 200 sempre para evitar retry infinito do ActivePayments
    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    console.error('[Webhook] Erro:', message)
    return NextResponse.json({ received: true }) // 200 mesmo com erro
  }
}
