import { NextRequest, NextResponse } from 'next/server'
import { isActivePaymentsConfigured, createPixCharge } from '@/lib/activepayments'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, amount, customerName, customerCpf } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId é obrigatório' }, { status: 400 })
    }

    const isPreviewMode = !isActivePaymentsConfigured()

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (isPreviewMode || orderId.startsWith('preview_')) {
      const { generateQRCode } = await import('@/lib/pix')
      const priceBRL = amount ?? 17.90
      const fakePixCode = `00020126580014BR.GOV.BCB.PIX0136preview-pix-code-${orderId.slice(-6)}5204000053039865406${String(Math.round(priceBRL * 100)).padStart(6, '0')}5802BR5906HYPEFY6008SAOPAULO6207050300016304FAKE`
      const pixQrCode = await generateQRCode(fakePixCode)

      return NextResponse.json({
        success: true,
        chargeId: `preview-${Date.now()}`,
        pixCode: fakePixCode,
        pixQrCode,
        priceBRL,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        preview: true,
      })
    }

    // ── MODO PRODUÇÃO — ActivePayments ────────────────────────────────────────
    if (!amount || !customerName || !customerCpf) {
      return NextResponse.json(
        { success: false, error: 'amount, customerName e customerCpf são obrigatórios' },
        { status: 400 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hypefy.netlify.app'

    const charge = await createPixCharge({
      amount,
      customerName,
      customerCpf,
      externalReference: orderId,
      postbackUrl: `${siteUrl}/api/payment/webhook`,
    })

    // Optionally persist chargeId to DB
    try {
      const { connectDB } = await import('@/lib/mongodb')
      const { default: Order } = await import('@/lib/models/Order')
      await connectDB()
      await Order.updateOne({ orderId }, { $set: { chargeId: charge.chargeId } })
    } catch {
      // non-fatal — charge was created, DB update failed
    }

    // Generate QR Code image from the text code
    const { generateQRCode } = await import('@/lib/pix')
    const pixQrCode = await generateQRCode(charge.pix.qrCode)

    return NextResponse.json({
      success: true,
      chargeId: charge.chargeId,
      pixCode: charge.pix.qrCode,
      pixQrCode,
      priceBRL: charge.amount,
      expiresAt: charge.pix.expiresAt,
      preview: false,
    })
  } catch (error) {
    console.error('Erro ao gerar pagamento:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao gerar dados de pagamento' },
      { status: 500 }
    )
  }
}
