import { NextRequest, NextResponse } from 'next/server'
import { isPreviewMode, makePreviewOrderId } from '@/lib/config'
import { getPackageById } from '@/data/packages'
import { cleanInstagramPost, cleanTikTokVideo, cleanProfile } from '@/lib/clean-links'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { packageId, username, postLink, comments } = body

    if (!packageId || !username) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
    }

    const pkg = getPackageById(packageId)
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Pacote não encontrado' }, { status: 404 })
    }

    const rawUser = username.trim().replace(/^@/, '')
    if (rawUser.length < 2) {
      return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 400 })
    }

    const instagramUser = `@${rawUser}`

    // Build the link that goes to BulkFollows:
    // - For post types (likes/views): clean & normalize the postLink
    // - For profile types (followers/stories): build from username
    const platform = pkg.platform ?? 'instagram'
    let instagramLink: string
    if (pkg.inputType === 'post' && postLink?.trim()) {
      const cleaned = platform === 'tiktok'
        ? cleanTikTokVideo(postLink.trim())
        : cleanInstagramPost(postLink.trim())
      if (!cleaned) {
        return NextResponse.json({ success: false, error: 'Link inválido. Cole o link direto do post.' }, { status: 400 })
      }
      instagramLink = cleaned
    } else {
      instagramLink = cleanProfile(rawUser, platform)
    }

    // ── MODO PREVIEW ─────────────────────────────────────────────────────────
    if (isPreviewMode) {
      const orderId = makePreviewOrderId(packageId, instagramUser)
      return NextResponse.json({ success: true, orderId, preview: true })
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
      instagramUser,
      instagramLink,
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
