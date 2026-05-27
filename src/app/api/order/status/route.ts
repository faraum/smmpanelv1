import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode, parsePreviewOrderId } from '@/lib/config'
import { isActivePaymentsConfigured, getChargeStatus } from '@/lib/activepayments'
import type { OrderStatus } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const chargeId = searchParams.get('chargeId')

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId é obrigatório' }, { status: 400 })
    }

    // ── PAYMENT STATUS POLLING (from checkout page) ───────────────────────────
    if (chargeId) {
      // Preview mode: return fake paid status after a delay (for testing)
      if (!isActivePaymentsConfigured() || orderId.startsWith('preview_')) {
        return NextResponse.json({
          success: true,
          paymentStatus: 'pending',
          preview: true,
        })
      }

      try {
        const charge = await getChargeStatus(chargeId)
        return NextResponse.json({
          success: true,
          paymentStatus: charge.status,
          paidAt: charge.paidAt,
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao consultar'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
      }
    }

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (isPreviewMode || orderId.startsWith('preview_')) {
      const parsed = parsePreviewOrderId(orderId)
      const { getPackageById } = await import('@/data/packages')
      const pkg = parsed ? getPackageById(parsed.packageId) : null

      return NextResponse.json({
        success: true,
        order: {
          orderId,
          serviceName: pkg ? `${pkg.quantity.toLocaleString('pt-BR')} ${pkg.name}` : 'Serviço de Exemplo',
          quantity: pkg?.quantity ?? 1000,
          instagramUser: '@usuario_exemplo',
          priceBRL: pkg?.priceBRL ?? 17.90,
          status: 'PROCESSING' as OrderStatus,
        },
        preview: true,
      })
    }

    // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
    const { connectDB } = await import('@/lib/mongodb')
    const { default: Order } = await import('@/lib/models/Order')
    const { getBulkFollowsClient } = await import('@/lib/bulkfollows')

    await connectDB()
    const order = await Order.findOne({ orderId }).lean()

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Sincronizar com BulkFollows se estiver processando
    if (order.bulkOrderId && order.status === 'PROCESSING') {
      try {
        const client = getBulkFollowsClient()
        const bulkStatus = await client.getOrderStatus(order.bulkOrderId)

        let newStatus: OrderStatus = order.status as OrderStatus
        switch (bulkStatus.status?.toLowerCase()) {
          case 'completed': newStatus = 'COMPLETED'; break
          case 'partial':
          case 'in progress':
          case 'processing': newStatus = 'PROCESSING'; break
          case 'canceled':
          case 'failed': newStatus = 'FAILED'; break
        }

        if (newStatus !== order.status) {
          await Order.updateOne({ orderId }, { status: newStatus })
          ;(order as any).status = newStatus
        }

        const { pixQrCode: _qr, pixCode: _pc, ...orderData } = order as any
        return NextResponse.json({ success: true, order: { ...orderData, bulkStatus } })
      } catch {
        // Ignorar falha no polling e retornar status do banco
      }
    }

    const { pixQrCode: _qr, pixCode: _pc, ...orderData } = order as any
    return NextResponse.json({ success: true, order: orderData })
  } catch (error) {
    console.error('Erro ao consultar status:', error)
    return NextResponse.json({ success: false, error: 'Falha ao consultar pedido' }, { status: 500 })
  }
}
