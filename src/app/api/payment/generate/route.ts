import { NextResponse } from 'next/server'
import { createPixCharge } from '@/lib/activepayments'
import { orderDataStore } from '@/lib/order-store'
import { TEST_MODE } from '@/data/packages'
 
export async function POST(req: Request) {
  try {
    const body = await req.json()
    // body: { amount, orderId, customerName, customerCpf,
    //         platform, serviceType, region, quantity, instagramLink, bumpQty }
 
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
        qrCodeBase64: qrDataUrl,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        preview: true,
      })
    }
 
    // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hypefy.netlify.app'
 
    const orderId     = body.orderId     || 'ord-' + Date.now()
    const platform    = body.platform    || 'instagram'
    const serviceType = body.serviceType || 'followers'
    const region      = body.region      || 'global'
    // TEST_MODE: forçar amount=1.00, quantity=100, sem bumps — ignorar o que o frontend mandou
    const amount      = TEST_MODE ? 1.00 : Number(body.amount)
    const quantity    = TEST_MODE ? 100  : (Number(body.quantity) || 100)
    const bumpQty     = TEST_MODE ? 0    : (Number(body.bumpQty)  || 0)
    const instagramLink = body.instagramLink || ''
    const username    = body.username    || ''
    const comments    = body.comments    || null
 
    // externalReference must be ≤ 100 chars — use orderId directly
    const externalReference = orderId

    console.log(`[Generate] externalRef length: ${externalReference.length} chars`)
 
    // Also keep in-memory store as fallback for the polling path
    orderDataStore.set(orderId, {
      platform,
      serviceType,
      region,
      quantity,
      instagramLink,
      username,
      bumpQty,
      comments: comments ?? undefined,
    })
 
    const charge = await createPixCharge({
      amount,
      customerName: body.customerName || 'Cliente Hypefy',
      customerCpf: (body.customerCpf || '00000000000').replace(/\D/g, ''),
      externalReference,
      postbackUrl: `${siteUrl}/api/payment/webhook`,
    })
 
    // Normalise qrCodeBase64 to data URL if needed
    const raw = charge.pix.qrCodeBase64 || ''
    const qrCodeBase64 = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`
 
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