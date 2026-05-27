import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature')
    const webhookSecret = process.env.ACTIVEPAYMENTS_WEBHOOK_SECRET

    // Verify HMAC signature if webhook secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { event, data } = payload

    if (event === 'charge.paid') {
      const { chargeId, externalReference } = data
      const orderId = externalReference

      console.log(`[Webhook] Pagamento confirmado! ChargeId: ${chargeId}, OrderId: ${orderId}`)

      if (!orderId) {
        return NextResponse.json({ received: true })
      }

      // Update order and trigger BulkFollows
      try {
        const { connectDB } = await import('@/lib/mongodb')
        const { default: Order } = await import('@/lib/models/Order')
        const { getBulkFollowsClient } = await import('@/lib/bulkfollows')

        await connectDB()
        const order = await Order.findOne({ orderId })

        if (!order || order.status !== 'PENDING_PAYMENT') {
          return NextResponse.json({ received: true })
        }

        order.status = 'PAID'
        order.paidAt = new Date()
        ;(order as any).chargeId = chargeId
        await order.save()

        try {
          const client = getBulkFollowsClient()
          const bulkResult = await client.createOrder(
            order.serviceId,
            order.instagramLink,
            order.quantity
          )
          order.bulkOrderId = bulkResult.order
          order.status = 'PROCESSING'
          await order.save()
        } catch (bulkError) {
          console.error(`[Webhook] Erro BulkFollows para ${orderId}:`, bulkError)
        }
      } catch (dbError) {
        console.error(`[Webhook] Erro DB para ${orderId}:`, dbError)
      }
    }

    if (event === 'charge.expired') {
      console.log(`[Webhook] PIX expirado: ${data.chargeId}`)
    }

    if (event === 'charge.cancelled') {
      console.log(`[Webhook] Cobrança cancelada: ${data.chargeId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
