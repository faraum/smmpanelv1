import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode } from '@/lib/config'

/**
 * Webhook de confirmação de pagamento PIX.
 * Em produção com gateway real, este endpoint receberá a notificação de pagamento.
 * Cada gateway tem seu próprio formato — adaptar conforme necessário.
 */
export async function POST(req: NextRequest) {
  // Ignorar em modo preview
  if (isPreviewMode) {
    return NextResponse.json({ success: true, message: 'Webhook ignorado (modo preview)' })
  }

  try {
    const body = await req.json()
    // TODO: Verificar assinatura/autenticidade do webhook do gateway
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId é obrigatório' }, { status: 400 })
    }

    const { connectDB } = await import('@/lib/mongodb')
    const { default: Order } = await import('@/lib/models/Order')
    const { getBulkFollowsClient } = await import('@/lib/bulkfollows')

    await connectDB()
    const order = await Order.findOne({ orderId })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ success: true, message: 'Pedido já processado' })
    }

    order.status = 'PAID'
    order.paidAt = new Date()
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
      console.error(`Erro ao criar pedido na BulkFollows para ${orderId}:`, bulkError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
