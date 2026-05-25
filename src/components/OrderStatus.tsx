'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Clock, Loader2, XCircle, AlertTriangle } from 'lucide-react'
import type { OrderStatus } from '@/types'

interface OrderStatusProps {
  orderId: string
  initialStatus: OrderStatus
  quantity: number
  serviceName: string
  instagramUser: string
  isPreview?: boolean
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode; progress: number }
> = {
  PENDING_PAYMENT: {
    label: 'Aguardando Pagamento',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/5 border-yellow-400/20',
    icon: <Clock className="h-6 w-6" />,
    progress: 10,
  },
  PAID: {
    label: 'Pagamento Confirmado',
    color: 'text-blue-400',
    bg: 'bg-blue-400/5 border-blue-400/20',
    icon: <CheckCircle className="h-6 w-6" />,
    progress: 30,
  },
  PROCESSING: {
    label: 'Processando Pedido',
    color: 'text-purple-400',
    bg: 'bg-purple-400/5 border-purple-400/20',
    icon: <Loader2 className="h-6 w-6 animate-spin" />,
    progress: 65,
  },
  COMPLETED: {
    label: 'Pedido Concluído! ✓',
    color: 'text-green-400',
    bg: 'bg-green-400/5 border-green-400/20',
    icon: <CheckCircle className="h-6 w-6" />,
    progress: 100,
  },
  FAILED: {
    label: 'Falha no Pedido',
    color: 'text-red-400',
    bg: 'bg-red-400/5 border-red-400/20',
    icon: <XCircle className="h-6 w-6" />,
    progress: 100,
  },
  REFUNDED: {
    label: 'Reembolsado',
    color: 'text-orange-400',
    bg: 'bg-orange-400/5 border-orange-400/20',
    icon: <AlertTriangle className="h-6 w-6" />,
    progress: 100,
  },
}

const STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'PENDING_PAYMENT', label: 'Aguardando' },
  { key: 'PAID',            label: 'Pago' },
  { key: 'PROCESSING',      label: 'Processando' },
  { key: 'COMPLETED',       label: 'Concluído' },
]

export default function OrderStatusComponent({
  orderId,
  initialStatus,
  quantity,
  serviceName,
  instagramUser,
  isPreview = false,
}: OrderStatusProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [progress, setProgress] = useState(0)
  const [bulkStatusText, setBulkStatusText] = useState<string | null>(null)

  // ── Animação de progresso no modo preview ─────────────────────────────────
  useEffect(() => {
    if (!isPreview) return

    // Animar barra de 0 → 100% em ~12 segundos
    let pct = 0
    setProgress(0)

    const interval = setInterval(() => {
      pct += 100 / 120 // ~0.83% por tick de 100ms → 120 ticks → 12s
      setProgress(Math.min(pct, 100))

      if (pct >= 100) {
        clearInterval(interval)
        setStatus('COMPLETED')
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isPreview])

  // ── Polling de status em modo produção ────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (isPreview) return
    try {
      const res = await fetch(`/api/order/status?orderId=${orderId}`)
      const data = await res.json()
      if (data.success) {
        setStatus(data.order.status)
        if (data.order.bulkStatus?.status) {
          setBulkStatusText(data.order.bulkStatus.status)
        }
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [orderId, isPreview])

  useEffect(() => {
    if (isPreview) return
    const finalStatuses: OrderStatus[] = ['COMPLETED', 'FAILED', 'REFUNDED']
    if (finalStatuses.includes(status)) return

    fetchStatus()
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [status, fetchStatus, isPreview])

  const config = STATUS_CONFIG[status]
  const displayProgress = isPreview ? progress : config.progress
  const currentStepIdx = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div
        className={`flex items-center justify-center gap-3 rounded-2xl border p-5 ${config.color} ${config.bg}`}
      >
        {config.icon}
        <div>
          <p className="text-base font-bold">{config.label}</p>
          {bulkStatusText && status === 'PROCESSING' && (
            <p className="text-xs opacity-70 mt-0.5">
              Plataforma: {bulkStatusText}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-600">
          <span>0%</span>
          <span className="text-purple-400 font-medium">{Math.round(displayProgress)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-1">
        {STEPS.map((step, idx) => {
          const done = status === 'COMPLETED' || (currentStepIdx !== -1 && idx < currentStepIdx)
          const active = step.key === status

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : active
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 ring-2 ring-purple-500/20'
                    : 'bg-white/5 border-white/10 text-gray-600'
                }`}
              >
                {done ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[10px] text-center leading-tight ${
                  active ? 'text-white' : done ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Order details */}
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-2.5 text-sm">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Detalhes do pedido</p>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Serviço', value: serviceName },
            { label: 'Quantidade', value: quantity.toLocaleString('pt-BR') },
            { label: 'Para', value: instagramUser },
            { label: 'ID', value: orderId },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-400 flex-shrink-0">{label}</span>
              <span className={`text-white font-medium truncate text-right ${label === 'ID' ? 'font-mono text-xs' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {status === 'COMPLETED' && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center space-y-1">
          <p className="text-green-400 font-semibold text-sm">🎉 Pedido entregue com sucesso!</p>
          <p className="text-xs text-gray-400">
            {quantity.toLocaleString('pt-BR')} {serviceName.toLowerCase()} foram enviados para {instagramUser}
          </p>
        </div>
      )}

      {status === 'PROCESSING' && !isPreview && (
        <p className="text-center text-xs text-gray-600">
          Atualiza automaticamente a cada 30 segundos
        </p>
      )}
    </div>
  )
}
