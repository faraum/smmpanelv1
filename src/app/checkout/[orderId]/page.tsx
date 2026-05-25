import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'
import PreviewBanner from '@/components/PreviewBanner'
import CheckoutClient from './CheckoutClient'
import { isPreviewMode, parsePreviewOrderId } from '@/lib/config'
import { getPackageById } from '@/data/packages'
import { formatBRL, formatQuantity } from '@/lib/utils'

interface Props {
  params: Promise<{ orderId: string }>
}

export const dynamic = 'force-dynamic'

interface OrderSummary {
  serviceName: string
  quantity: number
  instagramUser: string
  priceBRL: number
  pixCode: string
  pixQrCode: string
}

async function getOrderSummary(orderId: string): Promise<OrderSummary | null> {
  // ── MODO PREVIEW ─────────────────────────────────────────────────────────
  if (isPreviewMode || orderId.startsWith('preview_')) {
    const parsed = parsePreviewOrderId(orderId)
    const pkg = parsed ? getPackageById(parsed.packageId) : null

    return {
      serviceName: pkg ? pkg.name : 'Serviço de Exemplo',
      quantity: pkg?.quantity ?? 1000,
      instagramUser: '@usuario_exemplo',
      priceBRL: pkg?.priceBRL ?? 17.90,
      pixCode: '', // gerado pelo client
      pixQrCode: '', // gerado pelo client
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
      priceBRL: o.priceBRL,
      pixCode: o.pixCode || '',
      pixQrCode: o.pixQrCode || '',
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
    serviceName: 'Serviço',
    quantity: 1000,
    instagramUser: '@usuario',
    priceBRL: 17.90,
    pixCode: '',
    pixQrCode: '',
  }

  return (
    <>
      <Header />
      {isPreview && <PreviewBanner />}

      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à loja
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">Pagamento via PIX</h1>
          <p className="text-gray-400 text-sm mb-6">Escaneie o QR Code ou copie o código PIX</p>

          {/* Order summary */}
          <div className="mb-5 rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">Resumo do pedido</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Serviço</span>
                <span className="text-white font-medium">{summary.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantidade</span>
                <span className="text-white font-medium">{formatQuantity(summary.quantity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Para</span>
                <span className="text-white font-medium">{summary.instagramUser}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                <span className="text-gray-300 font-medium">Total</span>
                <span className="text-white font-bold text-base">{formatBRL(summary.priceBRL)}</span>
              </div>
            </div>
          </div>

          {/* PIX + simulate button (client) */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <CheckoutClient
              orderId={orderId}
              priceBRL={summary.priceBRL}
              initialPixCode={summary.pixCode}
              initialPixQrCode={summary.pixQrCode}
              isPreview={isPreview}
            />
          </div>
        </div>
      </main>
    </>
  )
}
