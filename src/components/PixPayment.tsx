'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Copy, Check, Clock, Loader2, QrCode } from 'lucide-react'
import { formatBRL } from '@/lib/utils'

interface PixPaymentProps {
  orderId: string
  priceBRL: number
  pixCode: string
  pixQrCode: string
  onSimulate?: () => void
  showSimulate?: boolean
}

export default function PixPayment({
  orderId,
  priceBRL,
  pixCode,
  pixQrCode,
  onSimulate,
  showSimulate = false,
}: PixPaymentProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutos
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = pixCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleSimulate = async () => {
    if (!onSimulate) return
    setSimulating(true)
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) {
        onSimulate()
      }
    } finally {
      setSimulating(false)
    }
  }

  const expired = timeLeft === 0

  return (
    <div className="space-y-5">
      {/* Timer */}
      <div
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
          expired
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : timeLeft < 300
            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
            : 'bg-white/5 border border-white/5 text-gray-300'
        }`}
      >
        <Clock className="h-4 w-4" />
        {expired ? (
          <span>QR Code expirado — recarregue a página</span>
        ) : (
          <span>Expira em {formatTime(timeLeft)}</span>
        )}
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="relative rounded-2xl bg-white p-4 shadow-xl shadow-purple-500/10">
          {pixQrCode ? (
            <Image
              src={pixQrCode}
              alt="QR Code PIX"
              width={220}
              height={220}
              className="rounded-lg"
              unoptimized
            />
          ) : (
            <div className="flex h-[220px] w-[220px] items-center justify-center">
              <QrCode className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {expired && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/70">
              <span className="text-sm font-semibold text-red-400">Expirado</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-center">
        <p className="text-sm text-gray-400">Valor a pagar</p>
        <p className="text-3xl font-black text-white mt-1">{formatBRL(priceBRL)}</p>
      </div>

      {/* Copy code */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 text-center">Ou copie o código PIX:</p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-gray-400 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
            {pixCode}
          </div>
          <button
            onClick={handleCopy}
            disabled={expired}
            className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-2.5 text-sm font-medium text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-300">Como pagar:</p>
        <ol className="space-y-1.5 text-xs text-gray-400">
          <li>1. Abra o app do seu banco</li>
          <li>2. Acesse a área PIX</li>
          <li>3. Escaneie o QR Code ou cole o código copiado</li>
          <li>4. Confirme o pagamento de {formatBRL(priceBRL)}</li>
          <li>5. Seu pedido será ativado automaticamente ✓</li>
        </ol>
      </div>

      {/* Simulate payment (dev only) */}
      {showSimulate && onSimulate && (
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-center text-gray-500 mb-3">
            🧪 Modo desenvolvimento — simulação de pagamento
          </p>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 py-3 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
          >
            {simulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulando...
              </>
            ) : (
              '✓ Simular Pagamento Confirmado'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
