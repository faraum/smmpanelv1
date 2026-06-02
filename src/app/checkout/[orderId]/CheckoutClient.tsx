'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Copy, Check, Clock, Loader2, QrCode, ShoppingCart,
  X, Shield, Zap, ChevronRight, User, CreditCard,
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
  instagramLink: string
  categorySlug: string
  comments?: string
}

interface BumpOffer {
  id: string
  name: string
  quantity: number
  price: number
  discount: string
}

type Phase = 'bump' | 'pix-form' | 'payment'

// ─── Order bump data ─────────────────────────────────────────────────────────

const seguidoresBumps: BumpOffer[] = [
  { id: 'b-seg-100',  name: '+100 Seguidores',   quantity: 100,  price: 4.90,  discount: '50% OFF' },
  { id: 'b-seg-500',  name: '+500 Seguidores',   quantity: 500,  price: 12.90, discount: '50% OFF' },
  { id: 'b-seg-1000', name: '+1.000 Seguidores', quantity: 1000, price: 19.90, discount: '50% OFF' },
]

function getCategoryKey(slug: string): string {
  if (slug.startsWith('seguidores')) return 'seguidores'
  if (slug.startsWith('curtidas'))   return 'curtidas'
  if (slug.startsWith('visualizacoes')) return 'visualizacoes'
  if (slug.startsWith('comentarios'))  return 'comentarios'
  return 'outros'
}

type ServiceType = 'followers' | 'likes' | 'views' | 'stories' | 'comments'
type Region = 'global' | 'brazil'

function parseCategory(slug: string): {
  platform: 'instagram' | 'tiktok'
  serviceType: ServiceType
  region: Region
} {
  const map: Record<string, { platform: 'instagram' | 'tiktok'; serviceType: ServiceType; region: Region }> = {
    'seguidores-mundiais':     { platform: 'instagram', serviceType: 'followers', region: 'global' },
    'seguidores-brasileiros':  { platform: 'instagram', serviceType: 'followers', region: 'brazil' },
    'curtidas-mundiais':       { platform: 'instagram', serviceType: 'likes',     region: 'global' },
    'curtidas-brasileiras':    { platform: 'instagram', serviceType: 'likes',     region: 'brazil' },
    'visualizacoes-reels':     { platform: 'instagram', serviceType: 'views',     region: 'global' },
    'views-stories':           { platform: 'instagram', serviceType: 'stories',   region: 'global' },
    'comentarios-brasileiros': { platform: 'instagram', serviceType: 'comments',  region: 'brazil' },
    'comentarios-mundiais':    { platform: 'instagram', serviceType: 'comments',  region: 'global' },
    'tiktok-seguidores-global': { platform: 'tiktok', serviceType: 'followers', region: 'global' },
    'tiktok-seguidores-br':     { platform: 'tiktok', serviceType: 'followers', region: 'brazil' },
    'tiktok-curtidas-global':   { platform: 'tiktok', serviceType: 'likes',     region: 'global' },
    'tiktok-curtidas-br':       { platform: 'tiktok', serviceType: 'likes',     region: 'brazil' },
    'tiktok-views-global':      { platform: 'tiktok', serviceType: 'views',     region: 'global' },
    'tiktok-views-br':          { platform: 'tiktok', serviceType: 'views',     region: 'brazil' },
  }
  return map[slug] ?? { platform: 'instagram', serviceType: 'followers', region: 'global' }
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

function validateCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return false
  if (/^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === parseInt(d[10])
}

function maskCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// ─── Checkout testimonials data ───────────────────────────────────────────────

const checkoutTestimonials = [
  { stars: 5, text: 'Recebi os seguidores em 3 minutos! Impressionante a rapidez.', user: '@maria_santos' },
  { stars: 5, text: 'Já comprei 4 vezes e sempre funciona perfeitamente. Recomendo!', user: '@lucas.dev' },
  { stars: 5, text: 'Melhor custo-benefício que encontrei. Suporte rápido também.', user: '@ana_beauty' },
]

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
  instagramLink,
  categorySlug,
  comments,
}: CheckoutClientProps) {
  const router = useRouter()

  // ── Phase state
  const [phase, setPhase] = useState<Phase>('bump')

  // ── Order bump state
  const [added, setAdded] = useState<BumpOffer[]>([])
  const [discountTimer, setDiscountTimer] = useState(600) // 10 min
  const [deliveries, setDeliveries] = useState(190681)

  // ── PIX form state
  const [customerName, setCustomerName] = useState('')
  const [customerCpf, setCustomerCpf] = useState('')
  const [nameError, setNameError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [generating, setGenerating] = useState(false)

  // ── Payment state
  const [chargeId, setChargeId] = useState<string | null>(null)
  const [isPreviewPayment, setIsPreviewPayment] = useState(false)
  const [finalBumpQty, setFinalBumpQty] = useState(0)
  const [pixCode, setPixCode] = useState(initialPixCode)
  const [pixQrCode, setPixQrCode] = useState(initialPixQrCode)
  const [copied, setCopied] = useState(false)
  const [paymentTimer, setPaymentTimer] = useState(5 * 60) // 5 minutes
  const [simulating, setSimulating] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  // ── Derived
  const purchasedCat = getCategoryKey(categorySlug)
  const bumpTotal = added.reduce((s, i) => s + i.price, 0)
  const total = priceBRL + bumpTotal
  const expired = paymentTimer === 0

  // ── Discount timer (bump phase)
  useEffect(() => {
    const id = setInterval(() => setDiscountTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Payment expiry timer
  useEffect(() => {
    if (phase !== 'payment' || paymentConfirmed) return
    const id = setInterval(() => setPaymentTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [phase, paymentConfirmed])

  // ── Delivery counter
  useEffect(() => {
    const id = setInterval(() => setDeliveries((d) => d + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // ── Polling (check payment status every 5s)
  useEffect(() => {
    if (phase !== 'payment' || !chargeId || paymentConfirmed || expired || isPreviewPayment) return

    const { platform, serviceType, region } = parseCategory(categorySlug)

    const poll = async () => {
      try {
        const params = new URLSearchParams({
          chargeId,
          orderId,
          platform,
          serviceType,
          region,
          quantity: String(quantity),
          instagramLink,
          bumpQty: String(finalBumpQty),
          ...(comments ? { comments } : {}),
        })
        const res = await fetch(`/api/payment/check?${params.toString()}`)
        const data = await res.json()
        if (data.status === 'paid') {
          setPaymentConfirmed(true)
          setTimeout(() => router.push(`/status/${orderId}`), 2000)
        }
      } catch {
        // silent fail
      }
    }

    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [phase, chargeId, orderId, quantity, instagramLink, categorySlug, finalBumpQty, paymentConfirmed, expired, isPreviewPayment, router])

  // ── Bump helpers
  const addOffer = (offer: BumpOffer) => {
    if (!added.find((i) => i.id === offer.id)) setAdded([...added, offer])
  }
  const removeOffer = (id: string) => setAdded(added.filter((i) => i.id !== id))
  const isAdded = (id: string) => !!added.find((i) => i.id === id)

  // ── Go from bump to pix-form
  const handleProceed = () => setPhase('pix-form')

  // ── Generate PIX (pix-form → payment)
  const handleGeneratePix = useCallback(async () => {
    setNameError('')
    setCpfError('')

    if (!customerName.trim() || customerName.trim().split(' ').length < 2) {
      setNameError('Informe seu nome completo (nome e sobrenome)')
      return
    }

    if (!validateCPF(customerCpf)) {
      setCpfError('CPF inválido. Verifique os 11 dígitos.')
      return
    }

    const { platform, serviceType, region } = parseCategory(categorySlug)
    const bumpQty = added.reduce((s, i) => s + i.quantity, 0)
    setFinalBumpQty(bumpQty)
    setGenerating(true)

    try {
      const res = await fetch('/api/payment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: total,
          customerName: customerName.trim(),
          customerCpf: customerCpf.replace(/\D/g, ''),
          platform,
          serviceType,
          region,
          quantity,
          instagramLink,
          bumpQty,
          comments: comments || null,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setNameError(data.error || 'Erro ao gerar PIX. Tente novamente.')
        return
      }
      setChargeId(data.chargeId ?? null)
      setIsPreviewPayment(!!data.preview)
      setPixCode(data.pixCode)
      // qrCodeBase64 pode ser data URL completa ou base64 puro
      const qr = data.qrCodeBase64 || ''
      setPixQrCode(qr.startsWith('data:') ? qr : qr ? `data:image/png;base64,${qr}` : '')
      setPaymentTimer(5 * 60)
      setPhase('payment')
    } catch {
      setNameError('Falha na conexão. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }, [orderId, total, customerName, customerCpf, categorySlug, quantity, instagramLink, added])

  // ── Copy PIX code
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

  // ── Simulate payment (preview only)
  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) {
        setPaymentConfirmed(true)
        setTimeout(() => router.push(`/status/${orderId}`), 2000)
      }
    } finally {
      setSimulating(false)
    }
  }

  const showSimulate = isPreviewPayment
  const catIcon = purchasedCat === 'seguidores' ? '👥'
    : purchasedCat === 'curtidas' ? '❤️'
    : purchasedCat === 'visualizacoes' ? '▶️'
    : purchasedCat === 'comentarios' ? '💬' : '⭐'

  // ════════════════════════════════════════════════════════════════
  // PHASE: PAYMENT CONFIRMED
  // ════════════════════════════════════════════════════════════════
  if (paymentConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-4xl">
          ✅
        </div>
        <h2 className="text-xl font-black text-white">Pagamento confirmado!</h2>
        <p className="text-sm text-gray-400">Redirecionando para o status do pedido…</p>
        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
      </div>
    )
  }

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

          {/* Timer badge */}
          {expired ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-center space-y-2">
              <p className="text-sm font-bold text-red-400">PIX expirado. Gere um novo.</p>
              <button
                onClick={() => { setPhase('pix-form'); setPaymentTimer(5 * 60) }}
                className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
              >
                ← Gerar novo PIX
              </button>
            </div>
          ) : (
            <div
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border ${
                paymentTimer < 60
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 blink'
                  : paymentTimer < 120
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : 'bg-white/5 border-white/5 text-gray-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              ⏰ EXPIRA EM {formatTime(paymentTimer)}
            </div>
          )}

          {/* Waiting badge + progress */}
          {!expired && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-emerald-400 tracking-wide">AGUARDANDO PAGAMENTO</span>
              </div>
              <div className="overflow-hidden rounded-full bg-white/5 h-1">
                <div className="h-full w-1/3 rounded-full bg-emerald-500 progress-bar" />
              </div>
            </div>
          )}

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative rounded-2xl bg-white p-4 shadow-xl shadow-purple-500/10">
              {pixQrCode ? (
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
              {expired && (
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

          {/* Copy button — pulsing */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              disabled={expired || !pixCode}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                copied
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-purple-500/20 border border-purple-500/40 text-purple-300 copy-pulse hover:bg-purple-500/30'
              }`}
            >
              {copied
                ? <><Check className="h-4 w-4" /> ✅ Copiado!</>
                : <><Copy className="h-4 w-4" /> 📋 Copiar código PIX</>}
            </button>
            {copied && (
              <p className="text-center text-xs text-emerald-400 font-medium">
                Código copiado! Cole no app do seu banco.
              </p>
            )}
          </div>

          {/* Code display (small) */}
          <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2 text-xs text-gray-500 font-mono truncate">
            {pixCode || '—'}
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

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🛡️', title: '7 dias de garantia', sub: 'Reembolso sem burocracia' },
              { icon: '⚡', title: 'Entrega imediata', sub: 'Em até 5 min após pagar' },
              { icon: '🔒', title: '100% seguro', sub: 'Sem precisar da sua senha' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center rounded-xl bg-white/5 border border-white/8 p-3 gap-1"
              >
                <span className="text-xl">{badge.icon}</span>
                <p className="text-[10px] font-bold text-white leading-tight">{badge.title}</p>
                <p className="text-[9px] text-gray-500 leading-tight">{badge.sub}</p>
              </div>
            ))}
          </div>

          {/* Checkout testimonials */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">
              O que nossos clientes dizem
            </p>
            <div className="space-y-2">
              {checkoutTestimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/5 border border-white/5 p-3 space-y-1"
                >
                  <div className="flex gap-0.5">
                    {'★★★★★'.split('').map((s, j) => (
                      <span key={j} className="text-yellow-400 text-xs">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">&quot;{t.text}&quot;</p>
                  <p className="text-[11px] font-bold text-white">— {t.user}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulate (preview only — hidden when PIX is real) */}
          {showSimulate && (
            <div className="border-t border-white/5 pt-4 space-y-2">
              <p className="text-xs text-center text-amber-400/70">
                🔧 Botão disponível em modo preview
              </p>
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
  // PHASE: PIX FORM (name + CPF)
  // ════════════════════════════════════════════════════════════════
  if (phase === 'pix-form') {
    return (
      <div className="space-y-4">
        {/* Order summary */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">Resumo do pedido</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-lg">
              {catIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{serviceName}</p>
              {added.length > 0 && (
                <p className="text-xs text-emerald-400">+{added.length} item(ns) adicional(is)</p>
              )}
            </div>
            <span className="text-sm font-black text-white flex-shrink-0">{formatBRL(total)}</span>
          </div>
        </div>

        {/* PIX data form */}
        <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-5 space-y-5">
          <div>
            <p className="text-sm font-bold text-white mb-1">Dados para o PIX</p>
            <p className="text-xs text-gray-500">Necessário para identificar o pagamento</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-purple-400" />
                Nome completo
              </span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setNameError('') }}
              placeholder="Seu nome completo"
              autoCapitalize="words"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {nameError && (
              <p className="mt-1.5 text-xs text-red-400">{nameError}</p>
            )}
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                CPF
              </span>
            </label>
            <input
              type="text"
              value={customerCpf}
              onChange={(e) => { setCustomerCpf(maskCPF(e.target.value)); setCpfError('') }}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {cpfError && (
              <p className="mt-1.5 text-xs text-red-400">{cpfError}</p>
            )}
          </div>

          <div className="rounded-lg bg-white/5 border border-white/5 p-3 text-xs text-gray-400">
            🔒 Seus dados são usados apenas para identificar o pagamento. Não armazenamos seu CPF.
          </div>

          <button
            onClick={handleGeneratePix}
            disabled={generating || !customerName.trim() || !customerCpf.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all duration-200 active:scale-95 hover:scale-[1.01] shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Gerando PIX…</>
            ) : (
              <>Gerar PIX — {formatBRL(total)} <ChevronRight className="h-4 w-4" /></>
            )}
          </button>

          <button
            onClick={() => setPhase('bump')}
            className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Voltar e editar pedido
          </button>
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
            {catIcon}
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
        <div
          className="px-4 py-3 text-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
        >
          <p className="text-sm font-black text-white tracking-wide">🚀 OFERTAS EXCLUSIVAS PARA ESTA COMPRA</p>
          <p className="text-xs text-white/80 mt-0.5">Turbine seu perfil antes de pagar — desconto de 50%</p>
        </div>

        <div className="bg-[#0f0f1a] p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            👥 Seguidores Extras
          </p>
          <p className="text-[10px] text-gray-500 mb-3">
            Entregues no mesmo perfil: <span className="text-purple-300 font-medium">{instagramUser}</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {seguidoresBumps.map((offer) => {
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
                  <span className="mb-1.5 self-start rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {offer.discount}
                  </span>
                  <p className="text-[11px] font-semibold text-white leading-tight mb-1">{offer.name}</p>
                  <p className="text-xs font-bold mb-2" style={{ color: '#10B981' }}>{formatBRL(offer.price)}</p>
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
      </div>

      {/* ── Cart / Total section ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] overflow-hidden">

        <div className="p-4 space-y-2 border-b border-white/5">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">
            <ShoppingCart className="inline h-3 w-3 mr-1" />
            Carrinho
          </p>

          <div className="flex justify-between text-sm">
            <span className="text-gray-300 truncate max-w-[70%]">{serviceName}</span>
            <span className="text-white font-medium">{formatBRL(priceBRL)}</span>
          </div>

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

          <div className="flex justify-between items-center border-t border-white/8 pt-2 mt-1">
            <span className="text-white font-bold">Total</span>
            <span className="text-xl font-black text-white">{formatBRL(total)}</span>
          </div>
        </div>

        {/* Trust signals */}
        <div className="px-4 py-3 space-y-2.5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
            <span className="text-gray-400">
              Desconto expira em:{' '}
              <span className={`font-bold ${discountTimer < 60 ? 'text-red-400' : 'text-orange-400'}`}>
                {formatTime(discountTimer)}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-base leading-none">🔥</span>
            <span className="text-gray-400">
              <span className="font-semibold text-white">{deliveries.toLocaleString('pt-BR')}</span> pedidos entregues
            </span>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-400">
            <Shield className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-white">Satisfação Garantida</span> — 7 dias de garantia. Compra 100% segura.
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
        </div>
      </div>
    </div>
  )
}
