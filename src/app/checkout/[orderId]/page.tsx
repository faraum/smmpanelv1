import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'
import CheckoutClient from './CheckoutClient'
import { isPreviewMode, parsePreviewOrderId } from '@/lib/config'
import { getPackageById } from '@/data/packages'

interface Props {
  params: Promise<{ orderId: string }>
}

export const dynamic = 'force-dynamic'

interface OrderSummary {
  serviceName: string
  quantity: number
  instagramUser: string
  instagramLink: string
  priceBRL: number
  pixCode: string
  pixQrCode: string
  categorySlug: string
}

async function getOrderSummary(orderId: string): Promise<OrderSummary | null> {
  // ── MODO PREVIEW ─────────────────────────────────────────────────────────
  if (isPreviewMode || orderId.startsWith('preview_')) {
    const parsed = parsePreviewOrderId(orderId)
    const pkg = parsed ? getPackageById(parsed.packageId) : null
    const instagramUser = parsed?.instagramUser ?? '@usuario_exemplo'
    const categorySlug = pkg?.categorySlug ?? 'seguidores-mundiais'
    const platform = categorySlug.startsWith('tiktok') ? 'tiktok' : 'instagram'
    const username = instagramUser.replace(/^@/, '')
    const instagramLink = platform === 'tiktok'
      ? `https://www.tiktok.com/@${username}`
      : `https://www.instagram.com/${username}/`

    return {
      serviceName: pkg ? pkg.name : 'Seguidores Mundiais',
      quantity: pkg?.quantity ?? 1000,
      instagramUser,
      instagramLink,
      priceBRL: pkg?.priceBRL ?? 17.90,
      pixCode: '',
      pixQrCode: '',
      categorySlug,
    }
  }

  // ── MODO PRODUÇÃO ─────────────────────────────────────────────────────────
  try {
    const { connectDB } = await import('@/lib/mongodb')
    const { default: Order } = await import('@/lib/models/Order')

    await connectDB()
    const order = await Order.findOne({ orderId }).lean()
    if (!order) return null

    const o = order as any
    return {
      serviceName: o.serviceName,
      quantity: o.quantity,
      instagramUser: o.instagramUser,
      instagramLink: o.instagramLink || o.instagramUser,
      priceBRL: o.priceBRL,
      pixCode: o.pixCode || '',
      pixQrCode: o.pixQrCode || '',
      categorySlug: o.categorySlug || 'seguidores-mundiais',
    }
  } catch {
    return null
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { orderId } = await params
  const order = await getOrderSummary(orderId)
  const isPreview = isPreviewMode || orderId.startsWith('preview_')

  if (!order && !isPreview) {
    notFound()
  }

  const summary = order ?? {
    serviceName: 'Seguidores Mundiais',
    quantity: 1000,
    instagramUser: parsePreviewOrderId(orderId)?.instagramUser ?? '@usuario_exemplo',
    instagramLink: `https://www.instagram.com/${(parsePreviewOrderId(orderId)?.instagramUser ?? '@usuario_exemplo').replace(/^@/, '')}/`,
    priceBRL: 17.90,
    pixCode: '',
    pixQrCode: '',
    categorySlug: 'seguidores-mundiais',
  }

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à loja
          </Link>

          <CheckoutClient
            orderId={orderId}
            priceBRL={summary.priceBRL}
            initialPixCode={summary.pixCode}
            initialPixQrCode={summary.pixQrCode}
            isPreview={isPreview}
            serviceName={summary.serviceName}
            quantity={summary.quantity}
            instagramUser={summary.instagramUser}
            instagramLink={summary.instagramLink}
            categorySlug={summary.categorySlug}
          />
        </div>
      </main>
    </>
  )
}
