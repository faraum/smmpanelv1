import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode, makePreviewOrderId } from '@/lib/config'
import { validateSocialInput } from '@/lib/utils'
import { getPackageById } from '@/data/packages'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { packageId, instagramInput, comments } = body

    if (!packageId || !instagramInput) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
    }

    const pkg = getPackageById(packageId)
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Pacote não encontrado' }, { status: 404 })
    }

    const validation = validateSocialInput(instagramInput, pkg.platform ?? 'instagram')
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Link ou usuário inválido' },
        { status: 400 }
      )
    }

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (isPreviewMode) {
      const orderId = makePreviewOrderId(packageId, validation.user)
      return NextResponse.json({
        success: true,
        orderId,
        preview: true,
      })
    }

    // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
    const { connectDB } = await import('@/lib/mongodb')
    const { default: Order } = await import('@/lib/models/Order')
    const { generatePixPayment } = await import('@/lib/pix')
    const { nanoid } = await import('nanoid')

    await connectDB()

    const orderId = nanoid(12)
    const { pixCode, pixQrCode } = await generatePixPayment(pkg.priceBRL, orderId)

    await Order.create({
      orderId,
      serviceId: pkg.bulkServiceId,
      serviceName: pkg.name,
      category: pkg.category,
      categorySlug: pkg.categorySlug,
      quantity: pkg.quantity,
      instagramUser: validation.user,
      instagramLink: validation.link,
      priceUSD: 0,
      priceBRL: pkg.priceBRL,
      status: 'PENDING_PAYMENT',
      comments: comments || null,
      pixCode,
      pixQrCode,
    })

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao criar pedido. Tente novamente.' },
      { status: 500 }
    )
  }
}
