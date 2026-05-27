import { NextResponse } from 'next/server'
import { getChargeStatus } from '@/lib/activepayments'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const chargeId = searchParams.get('chargeId')

    if (!chargeId) {
      return NextResponse.json({ error: 'chargeId obrigatório' }, { status: 400 })
    }

    const hasPaymentKeys =
      process.env.ACTIVEPAYMENTS_PUBLIC_KEY && process.env.ACTIVEPAYMENTS_SECRET_KEY

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (!hasPaymentKeys || chargeId.startsWith('preview-')) {
      return NextResponse.json({
        chargeId,
        status: 'pending',
        preview: true,
      })
    }

    // ── MODO PRODUÇÃO — consultar status real ─────────────────────────────────
    const charge = await getChargeStatus(chargeId)

    return NextResponse.json({
      chargeId: charge.chargeId,
      status: charge.status, // 'pending' | 'paid' | 'cancelled' | 'failed'
      paidAt: charge.paidAt || null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao consultar pagamento'
    console.error('Erro ao consultar status:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
