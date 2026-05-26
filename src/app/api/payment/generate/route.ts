import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode, parsePreviewOrderId } from '@/lib/config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId é obrigatório' }, { status: 400 })
    }

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (isPreviewMode || orderId.startsWith('preview_')) {
      const parsed = parsePreviewOrderId(orderId)
      const { getPackageById } = await import('@/data/packages')
      const pkg = parsed ? getPackageById(parsed.packageId) : null
      const amount = pkg?.priceBRL ?? 17.90

      const { generateQRCode } = await import('@/lib/pix')
      const fakePixCode = `00020126580014BR.GOV.BCB.PIX0136preview-pix-code-exemplo-${orderId.slice(-6)}5204000053039865406${amount.toFixed(2).replace('.', '')}5802BR5906HYPEFY6008SAOPAULO6207050300016304FAKE`
      const pixQrCode = await generateQRCode(fakePixCode)

      return NextResponse.json({
        success: true,
        pixCode: fakePixCode,
        pixQrCode,
        priceBRL: amount,
        expiresIn: 1800,
        preview: true,
      })
    }

    // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
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

    return NextResponse.json({
      success: true,
      pixCode: order.pixCode,
      pixQrCode: order.pixQrCode,
      priceBRL: order.priceBRL,
      expiresIn: 1800,
    })
  } catch (error) {
    console.error('Erro ao gerar pagamento:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao gerar dados de pagamento' },
      { status: 500 }
    )
  }
}
