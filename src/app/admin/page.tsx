'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatBRL } from '@/lib/utils'
import { Lock, RefreshCw, TrendingUp, ShoppingBag, Clock, CheckCircle, DollarSign, Eye } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'text-yellow-400 bg-yellow-400/10',
  PAID:            'text-blue-400 bg-blue-400/10',
  PROCESSING:      'text-purple-400 bg-purple-400/10',
  COMPLETED:       'text-green-400 bg-green-400/10',
  FAILED:          'text-red-400 bg-red-400/10',
  REFUNDED:        'text-orange-400 bg-orange-400/10',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Aguard. Pag.',
  PAID:            'Pago',
  PROCESSING:      'Processando',
  COMPLETED:       'Concluído',
  FAILED:          'Falhou',
  REFUNDED:        'Reembolsado',
}

export default function AdminPage() {
  const isPreview = process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true'

  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(isPreview) // preview: skip auth
  const [authError, setAuthError] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = useCallback(async (pwd: string) => {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (!isPreview) headers['x-admin-password'] = pwd

      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/balance', { headers }),
        fetch(`/api/admin/orders?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ''}`, { headers }),
      ])

      if (!isPreview && statsRes.status === 401) {
        setAuthenticated(false)
        setAuthError('Senha incorreta')
        return
      }

      const [statsData, ordersData] = await Promise.all([statsRes.json(), ordersRes.json()])

      if (statsData.success) setStats(statsData.stats)
      if (ordersData.success) {
        setOrders(ordersData.orders)
        setTotalPages(ordersData.pagination?.pages ?? 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, isPreview])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthenticated(true)
    fetchData(password)
  }

  useEffect(() => {
    if (authenticated) fetchData(password)
  }, [authenticated, page, statusFilter]) // eslint-disable-line

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Lock className="h-5 w-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white">
              <span style={{ color: '#8B5CF6' }}>Engaja</span>fy — Painel Admin
            </h1>
          </div>
          <form onSubmit={handleLogin} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                autoFocus
              />
              {authError && <p className="mt-1.5 text-xs text-red-400">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 py-3 text-sm font-bold text-white hover:from-purple-400 hover:to-purple-600 transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
            {isPreview && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400">
                <Eye className="h-3.5 w-3.5" />
                Modo Preview — dados fictícios
              </div>
            )}
          </div>
          <button
            onClick={() => fetchData(password)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: <ShoppingBag className="h-5 w-5" />, label: 'Total', value: stats.totalOrders, color: 'text-blue-400' },
              { icon: <TrendingUp className="h-5 w-5" />,  label: 'Hoje',  value: stats.todayOrders, color: 'text-purple-400' },
              { icon: <Clock className="h-5 w-5" />,       label: 'Pendentes', value: stats.pendingOrders, color: 'text-yellow-400' },
              { icon: <CheckCircle className="h-5 w-5" />, label: 'Concluídos', value: stats.completedOrders, color: 'text-green-400' },
              { icon: <DollarSign className="h-5 w-5" />,  label: 'Faturamento', value: formatBRL(stats.totalRevenueBRL), color: 'text-green-400' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* BulkFollows balance */}
        {stats?.bulkBalance && (
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-300">Saldo BulkFollows</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isPreview ? 'Dados fictícios de demonstração' : 'Saldo disponível para novos pedidos'}
              </p>
            </div>
            <p className="text-2xl font-black text-white">
              ${parseFloat(stats.bulkBalance).toFixed(2)}{' '}
              <span className="text-sm text-gray-400">{stats.bulkCurrency}</span>
            </p>
          </div>
        )}

        {/* Orders table */}
        <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">
              Pedidos
              {isPreview && <span className="ml-2 text-xs text-amber-400/70">(exemplo)</span>}
            </h2>
            {!isPreview && (
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 outline-none"
              >
                <option value="">Todos</option>
                <option value="PENDING_PAYMENT">Aguardando Pagamento</option>
                <option value="PAID">Pago</option>
                <option value="PROCESSING">Processando</option>
                <option value="COMPLETED">Concluído</option>
                <option value="FAILED">Falhou</option>
              </select>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-500 uppercase tracking-wider">
                  {['ID', 'Serviço', 'Perfil', 'Qtd', 'Valor', 'Status', 'Data'].map((h) => (
                    <th key={h} className={`px-4 py-3 ${['Qtd', 'Valor'].includes(h) ? 'text-right' : h === 'Status' ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500 text-sm">
                      {loading ? 'Carregando...' : 'Nenhum pedido encontrado'}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.orderId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{order.orderId}</td>
                      <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">{order.serviceName}</td>
                      <td className="px-4 py-3 text-gray-300">{order.instagramUser}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{Number(order.quantity).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right font-medium text-white">{formatBRL(order.priceBRL)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || 'text-gray-400 bg-white/5'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && !isPreview && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-40">
                ← Anterior
              </button>
              <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-40">
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
