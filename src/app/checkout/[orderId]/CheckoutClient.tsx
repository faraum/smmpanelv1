'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Copy, Check, Clock, Loader2, QrCode, ShoppingCart,
  X, Shield, Zap, ChevronRight,
} from 'lucide-react'
import { formatBRL, formatNumber } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckoutClientProps {
  orderId: string
  priceBRL: number
  initialPixCode: string
  initialPixQrCode: string
  isPreview: boolean
  serviceName: string
  quantity: number
  instagramUser: string
  categorySlug: string
}

interface BumpOffer {
  id: string
  name: string
  quantity: number
  price: number
  discount: string
}

type Phase = 'bump' | 'payment'

// ─── Order bump data ─────────────────────────────────────────────────────────

const bumpOffers: Record<string, BumpOffer[]> = {
  seguidores: [
    { id: 'b-seg-100',   name: '+100 Seguidores',   quantity: 100,   price: 4.90,  discount: '50% OFF' },
    { id: 'b-seg-500',   name: '+500 Seguidores',   quantity: 500,   price: 12.90, discount: '50% OFF' },
    { id: 'b-seg-700',   name: '+700 Seguidores',   quantity: 700,   price: 14.90, discount: '50% OFF' },
  ],
  curtidas: [
    { id: 'b-cur-100',   name: '100 Curtidas',      quantity: 100,   price: 4.90,  discount: '50% OFF' },
    { id: 'b-cur-500',   name: '500 Curtidas',      quantity: 500,   price: 8.90,  discount: '50% OFF' },
    { id: 'b-cur-1000',  name: '1.000 Curtidas',    quantity: 1000,  price: 9.90,  discount: '50% OFF' },
  ],
  visualizacoes: [
    { id: 'b-vis-1000',  name: '1.000 Views',       quantity: 1000,  price: 4.90,  discount: '50% OFF' },
    { id: 'b-vis-5000',  name: '5.000 Views',       quantity: 5000,  price: 8.90,  discount: '50% OFF' },
    { id: 'b-vis-10000', name: '10.000 Views',      quantity: 10000, price: 9.90,  discount: '50% OFF' },
  ],
  comentarios: [
    { id: 'b-com-5',     name: '5 Comentários',     quantity: 5,     price: 5.90,  discount: '50% OFF' },
    { id: 'b-com-10',    name: '10 Comentários',    quantity: 10,    price: 9.90,  discount: '50% OFF' },
    { id: 'b-com-20',    name: '20 Comentários',    quantity: 20,    price: 14.90, discount: '50% OFF' },
  ],
}

const categoryMeta: Record<string, { label: string; icon: string }> = {
  seguidores:    { label: 'Seguidores',         icon: '👥' },
  curtidas:      { label: 'Curtidas',           icon: '❤️' },
  visualizacoes: { label: 'Visualizações Reels', icon: '▶️' },
  comentarios:   { label: 'Comentários',        icon: '💬' },
}

const ALL_CATS = ['seguidores', 'curtidas', 'visualizacoes', 'comentarios']

function getCategoryKey(categorySlug: string): string {
  if (categorySlug.startsWith('seguidores')) return 'seguidores'
  if (categorySlug.startsWith('curtidas'))   return 'curtidas'
  if (categorySlug.startsWith('visualizacoes')) return 'visualizacoes'
  if (categorySlug.startsWith('comentarios'))  return 'comentarios'
  return 'seguidores'
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CheckoutClient({
  orderId,
  priceBRL,
  initialPixCode,
  initialPixQrCode,
  isPreview,
  serviceName,
  quantity,
  instagramUser,
  categorySlug,
}: CheckoutClientProps) {
  const router = useRouter()

  // ── Phase state
  const [phase, setPhase] = useState<Phase>('bump')

  // ── Order bump state
  const [added, setAdded] = useState<BumpOffer[]>([])
  const [discountTimer, setDiscountTimer] = useState(600) // 10 min
  const [deliveries, setDeliveries] = useState(190681)

  // ── Payment state
  const [pixCode, setPixCode] = useState(initialPixCode)
  const [pixQrCode, setPixQrCode] = useState(initialPixQrCode)
  const [loadingPix, setLoadingPix] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentTimer, setPaymentTimer] = useState(30 * 60)
  const [simulating, setSimulating] = useState(false)

  // ── Derived
  const purchasedCat = getCategoryKey(categorySlug)
  const orderedCats = [purchasedCat, ...ALL_CATS.filter((c) => c !== purchasedCat)]
  const bumpTotal = added.reduce((s, i) => s + i.price, 0)
  const total = priceBRL + bumpTotal

  // ── Timers
  useEffect(() => {
    const id = setInterval(() => setDiscountTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== 'payment') return
    const id = setInterval(() => setPaymentTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    const id = setInterval(() => setDeliveries((d) => d + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // ── Bump helpers
  const addOffer = (offer: BumpOffer) => {
    if (!added.find((i) => i.id === offer.id)) setAdded([...added, offer])
  }
  const removeOffer = (id: string) => setAdded(added.filter((i) => i.id !== id))
  const isAdded = (id: string) => !!added.find((i) => i.id === id)

  // ── Proceed to payment
  const handleProceed = useCallback(async () => {
    setPhase('payment')
    if (!initialPixCode) {
      setLoadingPix(true)
      try {
        const res = await fetch('/api/payment/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        const data = await res.json()
        if (data.success) {
          setPixCode(data.pixCode)
          setPixQrCode(data.pixQrCode)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingPix(false)
      }
    }
  }, [orderId, initialPixCode])

  // ── Payment helpers
  const handleCopy = async () => {
    if (!pixCode) return
    try {
      await navigator.clipboard.writeText(pixCode)
    } catch {
      const el = document.createElement('textarea')
      el.value = pixCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) router.push(`/status/${orderId}`)
    } finally {
      setSimulating(false)
    }
  }

  const expired = paymentTimer === 0
  const showSimulate = isPreview || process.env.NODE_ENV === 'development'

  // ════════════════════════════════════════════════════════════════
  // PHASE: PAYMENT
  // ════════════════════════════════════════════════════════════════
  if (phase === 'payment') {
    return (
      <div className="space-y-4">
        {/* Order summary recap */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-1.5 text-sm">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Resumo do pedido</p>
          <div className="flex justify-between">
            <span className="text-gray-400 truncate max-w-[60%]">{serviceName}</span>
            <span className="text-white font-medium">{formatBRL(priceBRL)}</span>
          </div>
          {added.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-400 truncate max-w-[60%]">{item.name}</span>
              <span className="text-emerald-400 font-medium">{formatBRL(item.price)}</span>
            </div>
          ))}
          {added.length > 0 && (
            <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
              <span className="text-white font-semibold">Total</span>
              <span className="text-white font-bold text-base">{formatBRL(total)}</span>
            </div>
          )}
        </div>

        {/* PIX payment card */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-5">
          {/* Payment expiry timer */}
          <div
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium ${
              expired
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : paymentTimer < 300
                ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                : 'bg-white/5 border border-white/5 text-gray-400'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {expired
              ? 'QR Code expirado — recarregue a página'
              : `PIX expira em ${formatTime(paymentTimer)}`}
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative rounded-2xl bg-white p-4 shadow-xl shadow-purple-500/10">
              {loadingPix ? (
                <div className="flex h-[200px] w-[200px] items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : pixQrCode ? (
                <Image
                  src={pixQrCode}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized
                />
              ) : (
                <div className="flex h-[200px] w-[200px] flex-col items-center justify-center gap-2">
                  <QrCode className="h-10 w-10 text-gray-300" />
                  <p className="text-xs text-gray-400 text-center">QR Code indisponível</p>
                </div>
              )}
              {expired && !loadingPix && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                  <span className="text-sm font-bold text-red-500">Expirado</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-xs text-gray-400">Valor a pagar</p>
            <p className="text-3xl font-black text-white mt-1">{formatBRL(total)}</p>
            {added.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                inclui {added.length} {added.length === 1 ? 'item adicional' : 'itens adicionais'}
              </p>
            )}
          </div>

          {/* Copy code */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 text-center">Código PIX (copia e cola):</p>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-gray-400 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {loadingPix ? 'Gerando código...' : (pixCode || '—')}
              </div>
              <button
                onClick={handleCopy}
                disabled={expired || !pixCode || loadingPix}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-2.5 text-xs font-medium text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5" /> Copiado!</>
                  : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-300">Como pagar:</p>
            <ol className="space-y-1 text-xs text-gray-400 list-none">
              {[
                'Abra o app do seu banco',
                'Acesse a área PIX',
                'Escaneie o QR Code ou cole o código copiado',
                `Confirme o pagamento de ${formatBRL(total)}`,
                'Seu pedido será ativado automaticamente ✓',
              ].map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="flex-shrink-0 text-purple-400">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Simulate (preview) */}
          {showSimulate && (
            <div className="border-t border-white/5 pt-4 space-y-2">
              {isPreview && (
                <p className="text-xs text-center text-amber-400/70">
                  🧪 Botão disponível em modo preview
                </p>
              )}
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 py-3 text-sm font-semibold text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {simulating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                  : '✓ Simular Pagamento Confirmado'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE: BUMP
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">

      {/* ── Original order summary ── */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">Seu pedido</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-lg">
            {categoryMeta[purchasedCat]?.icon ?? '⭐'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{serviceName}</p>
            <p className="text-xs text-gray-400">{formatNumber(quantity)} unidades • {instagramUser}</p>
          </div>
          <span className="text-sm font-bold text-white flex-shrink-0">{formatBRL(priceBRL)}</span>
        </div>
      </div>

      {/* ── Order bump banner ── */}
      <div className="rounded-2xl overflow-hidden border border-purple-500/20">
        {/* Banner header */}
        <div
          className="px-4 py-3 text-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
        >
          <p className="text-sm font-black text-white tracking-wide">🚀 OFERTAS EXCLUSIVAS PARA ESTA COMPRA</p>
          <p className="text-xs text-white/80 mt-0.5">Turbine seu perfil antes de pagar — desconto de 50%</p>
        </div>

        {/* Category sections */}
        <div className="bg-[#0f0f1a] divide-y divide-white/5">
          {orderedCats.map((cat) => {
            const meta = categoryMeta[cat]
            const offers = bumpOffers[cat]
            if (!meta || !offers) return null
            return (
              <div key={cat} className="p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {meta.icon} {meta.label}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {offers.map((offer) => {
                    const alreadyAdded = isAdded(offer.id)
                    return (
                      <div
                        key={offer.id}
                        className={`relative flex flex-col rounded-xl border p-2.5 transition-all ${
                          alreadyAdded
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : 'border-white/8 bg-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* 50% OFF badge */}
                        <span className="mb-1.5 self-start rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                          {offer.discount}
                        </span>
                        {/* Name */}
                        <p className="text-[11px] font-semibold text-white leading-tight mb-1">
                          {offer.name}
                        </p>
                        {/* Price */}
                        <p className="text-xs font-bold mb-2" style={{ color: '#10B981' }}>
                          {formatBRL(offer.price)}
                        </p>
                        {/* Button */}
                        <button
                          onClick={() => alreadyAdded ? removeOffer(offer.id) : addOffer(offer)}
                          className={`w-full rounded-lg py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                            alreadyAdded
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-500 text-white hover:bg-emerald-400'
                          }`}
                        >
                          {alreadyAdded ? 'Adicionado ✓' : 'Adicionar'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Cart / Total section ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] overflow-hidden">

        {/* Cart items */}
        <div className="p-4 space-y-2 border-b border-white/5">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">
            <ShoppingCart className="inline h-3 w-3 mr-1" />
            Carrinho
          </p>

          {/* Original item */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-300 truncate max-w-[70%]">{serviceName}</span>
            <span className="text-white font-medium">{formatBRL(priceBRL)}</span>
          </div>

          {/* Added bump items */}
          {added.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  onClick={() => removeOffer(item.id)}
                  className="flex-shrink-0 rounded-full p-0.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  aria-label={`Remover ${item.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="text-emerald-400 truncate">{item.name}</span>
              </div>
              <span className="font-medium text-emerald-400 flex-shrink-0">{formatBRL(item.price)}</span>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center border-t border-white/8 pt-2 mt-1">
            <span className="text-white font-bold">Total</span>
            <span className="text-xl font-black text-white">{formatBRL(total)}</span>
          </div>
        </div>

        {/* Trust signals */}
        <div className="px-4 py-3 space-y-2.5 border-b border-white/5 bg-white/[0.02]">
          {/* Discount timer */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
            <span className="text-gray-400">
              Desconto expira em:{' '}
              <span className={`font-bold ${discountTimer < 60 ? 'text-red-400' : 'text-orange-400'}`}>
                {formatTime(discountTimer)}
              </span>
            </span>
          </div>

          {/* Delivery counter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-base leading-none">🔥</span>
            <span className="text-gray-400">
              <span className="font-semibold text-white">{deliveries.toLocaleString('pt-BR')}</span> pedidos entregues com sucesso
            </span>
          </div>

          {/* Guarantee */}
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <Shield className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-white">Satisfação Garantida</span> — 7 dias de garantia por lei.
              Compra 100% segura.
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 space-y-3">
          <button
            onClick={handleProceed}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all duration-200 active:scale-95 hover:scale-[1.01] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          >
            <ShoppingCart className="h-4 w-4" />
            Garantir meu pedido — {formatBRL(total)}
            <ChevronRight className="h-4 w-4" />
          </button>

          <p className="text-center text-[11px] text-gray-500">
            🔒 Pagamento 100% seguro via PIX
          </p>

          {isPreview && (
            <p className="text-center text-[11px] text-amber-400/60">
              🧪 Modo preview — dados fictícios
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
