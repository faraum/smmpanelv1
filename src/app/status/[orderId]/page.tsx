import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import Header from '@/components/Header'
import OrderStatusComponent from '@/components/OrderStatus'
import { isPreviewMode, parsePreviewOrderId } from '@/lib/config'
import { getPackageById } from '@/data/packages'
import type { OrderStatus } from '@/types'

interface Props {
  params: Promise<{ orderId: string }>
}

export const dynamic = 'force-dynamic'

interface OrderData {
  orderId: string
  serviceName: string
  quantity: number
  instagramUser: string
  priceBRL: number
  status: OrderStatus
}

async function getOrderData(orderId: string): Promise<OrderData | null> {
  // ── MODO PREVIEW ─────────────────────────────────────────────────────────
  if (isPreviewMode || orderId.startsWith('preview_')) {
    const parsed = parsePreviewOrderId(orderId)
    const pkg = parsed ? getPackageById(parsed.packageId) : null

    return {
      orderId,
      serviceName: pkg ? pkg.name : 'Serviço de Exemplo',
      quantity: pkg?.quantity ?? 1000,
      instagramUser: '@usuario_exemplo',
      priceBRL: pkg?.priceBRL ?? 17.90,
      status: 'PROCESSING',
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
      orderId: o.orderId,
      serviceName: o.serviceName,
      quantity: o.quantity,
      instagramUser: o.instagramUser,
      priceBRL: o.priceBRL,
      status: o.status,
    }
  } catch {
    return null
  }
}

export default async function StatusPage({ params }: Props) {
  const { orderId } = await params
  const isPreview = isPreviewMode || orderId.startsWith('preview_')
  const orderData = await getOrderData(orderId)

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Pedido não encontrado.</p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
          >
            Voltar à loja
          </Link>
        </div>
      </div>
    )
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP

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

          <h1 className="text-2xl font-bold text-white mb-1">Status do Pedido</h1>
          <p className="text-sm text-gray-400 mb-6">Acompanhe a entrega em tempo real</p>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <OrderStatusComponent
              orderId={orderData.orderId}
              initialStatus={orderData.status}
              quantity={orderData.quantity}
              serviceName={orderData.serviceName}
              instagramUser={orderData.instagramUser}
              isPreview={isPreview}
            />
          </div>

          {/* Support card */}
          <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center gap-4">
            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Precisa de ajuda?</p>
              <p className="text-xs text-gray-400 truncate">
                ID do pedido: <span className="font-mono text-purple-400">{orderId}</span>
              </p>
            </div>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=Olá! Preciso de ajuda com o pedido ${orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
              >
                Suporte
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
