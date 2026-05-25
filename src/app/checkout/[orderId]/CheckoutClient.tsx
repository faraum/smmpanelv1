'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Copy, Check, Clock, Loader2, QrCode } from 'lucide-react'
import { formatBRL } from '@/lib/utils'

interface CheckoutClientProps {
  orderId: string
  priceBRL: number
  initialPixCode: string
  initialPixQrCode: string
  isPreview: boolean
}

export default function CheckoutClient({
  orderId,
  priceBRL,
  initialPixCode,
  initialPixQrCode,
  isPreview,
}: CheckoutClientProps) {
  const router = useRouter()
  const [pixCode, setPixCode] = useState(initialPixCode)
  const [pixQrCode, setPixQrCode] = useState(initialPixQrCode)
  const [loadingPix, setLoadingPix] = useState(!initialPixCode)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [simulating, setSimulating] = useState(false)

  // Buscar PIX do server (em preview ou quando não foi carregado server-side)
  useEffect(() => {
    if (initialPixCode) return
    setLoadingPix(true)
    fetch('/api/payment/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPixCode(data.pixCode)
          setPixQrCode(data.pixQrCode)
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPix(false))
  }, [orderId, initialPixCode])

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

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
      if (data.success) {
        router.push(`/status/${orderId}`)
      }
    } finally {
      setSimulating(false)
    }
  }

  const expired = timeLeft === 0
  const showSimulate = isPreview || process.env.NODE_ENV === 'development'

  return (
    <div className="space-y-5">
      {/* Timer */}
      <div
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium ${
          expired
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : timeLeft < 300
            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
            : 'bg-white/5 border border-white/5 text-gray-400'
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        {expired ? 'QR Code expirado — recarregue a página' : `Expira em ${formatTime(timeLeft)}`}
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
        <p className="text-3xl font-black text-white mt-1">{formatBRL(priceBRL)}</p>
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
            {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
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
            `Confirme o pagamento de ${formatBRL(priceBRL)}`,
            'Seu pedido será ativado automaticamente ✓',
          ].map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex-shrink-0 text-purple-400">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Simulate button */}
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
            {simulating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
            ) : (
              '✓ Simular Pagamento Confirmado'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
