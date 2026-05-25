import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode } from '@/lib/config'

/**
 * Simulação de pagamento — disponível em modo preview e em NODE_ENV=development.
 * Em produção com variáveis configuradas, este endpoint retorna 403.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId } = body

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId é obrigatório' }, { status: 400 })
  }

  // ── MODO PREVIEW — sempre disponível ────────────────────────────────────────
  if (isPreviewMode || orderId.startsWith('preview_')) {
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Pagamento simulado (modo preview)',
      preview: true,
    })
  }

  // ── MODO PRODUÇÃO — só em dev ────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Não disponível em produção' },
      { status: 403 }
    )
  }

  try {
    const { connectDB } = await import('@/lib/mongodb')
    const { default: Order } = await import('@/lib/models/Order')

    await connectDB()
    const order = await Order.findOne({ orderId })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ success: false, error: 'Pedido já processado' }, { status: 400 })
    }

    order.status = 'PAID'
    order.paidAt = new Date()
    await order.save()

    if (order.serviceId && order.serviceId !== 0) {
      try {
        const { getBulkFollowsClient } = await import('@/lib/bulkfollows')
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
        console.warn('BulkFollows não disponível em dev:', bulkError)
        order.status = 'PROCESSING'
        await order.save()
      }
    } else {
      order.status = 'PROCESSING'
      await order.save()
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Erro na simulação:', error)
    return NextResponse.json({ success: false, error: 'Falha na simulação' }, { status: 500 })
  }
}
