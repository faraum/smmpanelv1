import { NextResponse } from 'next/server'
import { createPixCharge } from '@/lib/activepayments'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // body: { amount, orderId, customerName, customerCpf }

    const hasPaymentKeys =
      process.env.ACTIVEPAYMENTS_PUBLIC_KEY && process.env.ACTIVEPAYMENTS_SECRET_KEY

    // ── MODO PREVIEW — só quando NÃO tem as keys configuradas ────────────────
    if (!hasPaymentKeys) {
      const QRCode = (await import('qrcode')).default
      const fakePixCode = '00020126580014BR.GOV.BCB.PIX0136preview-pix-' + Date.now()
      const qrDataUrl = await QRCode.toDataURL(fakePixCode)

      return NextResponse.json({
        chargeId: 'preview-' + Date.now(),
        pixCode: fakePixCode,
        qrCodeBase64: qrDataUrl, // já é data URL neste caso
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        preview: true,
      })
    }

    // ── MODO PRODUÇÃO — criar cobrança PIX real via ActivePayments ────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hypefy.netlify.app'

    const charge = await createPixCharge({
      amount: body.amount,
      customerName: body.customerName || 'Cliente Hypefy',
      customerCpf: (body.customerCpf || '00000000000').replace(/\D/g, ''),
      externalReference: body.orderId || 'order-' + Date.now(),
      postbackUrl: `${siteUrl}/api/payment/webhook`,
    })

    // Normalizar qrCodeBase64 para data URL se necessário
    const raw = charge.pix.qrCodeBase64 || ''
    const qrCodeBase64 = raw.startsWith('data:')
      ? raw
      : `data:image/png;base64,${raw}`

    return NextResponse.json({
      chargeId: charge.chargeId,
      pixCode: charge.pix.qrCode,
      qrCodeBase64,
      expiresAt: charge.pix.expiresAt,
      preview: false,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar pagamento'
    console.error('Erro ao gerar PIX:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
