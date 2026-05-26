'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from '@/data/packages'
import { formatBRL, formatQuantity, validateSocialInput } from '@/lib/utils'
import { X, AtSign, Link as LinkIcon, Loader2, AlertCircle, Mail } from 'lucide-react'

interface UsernameModalProps {
  pkg: Package | null
  onClose: () => void
}

function getTypeIcon(slug: string): string {
  if (slug.includes('seguidores')) return '👥'
  if (slug.includes('curtidas')) return '❤️'
  if (slug.includes('visualizacoes') || slug.includes('views')) return '▶️'
  if (slug.includes('comentarios')) return '💬'
  if (slug.includes('stories')) return '👁️'
  return '⭐'
}

export default function UsernameModal({ pkg, onClose }: UsernameModalProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pkg) {
      setInput('')
      setEmail('')
      setError('')
      setEmailError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [pkg])

  // Bloquear scroll do body quando modal está aberta
  useEffect(() => {
    if (pkg) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [pkg])

  if (!pkg) return null

  const isPost = pkg.inputType === 'post'
  const isTikTok = pkg.platform === 'tiktok'
  const platformLabel = isTikTok ? 'TikTok' : 'Instagram'

  const getPlaceholder = () => {
    if (isPost) {
      return isTikTok
        ? 'https://www.tiktok.com/@usuario/video/...'
        : 'https://www.instagram.com/p/...'
    }
    return '@seu_usuario'
  }

  const getInputHint = () => {
    if (isPost) {
      return isTikTok
        ? 'Cole o link do vídeo TikTok que deseja impulsionar'
        : 'Cole o link do post ou reel que deseja impulsionar'
    }
    return isTikTok
      ? 'Informe o @ ou link completo do perfil TikTok'
      : 'Informe o @ ou o link completo do perfil'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')

    const validation = validateSocialInput(input, pkg.platform ?? 'instagram')
    if (!validation.valid) {
      setError(
        isPost
          ? `Cole o link direto do ${isTikTok ? 'vídeo TikTok' : 'post, reel ou story do Instagram'}`
          : `Informe o @ do usuário ou o link do perfil ${platformLabel}`
      )
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Informe um email válido para receber a confirmação do pedido')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, instagramInput: input, email: email.trim() }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Erro ao criar pedido')
        setLoading(false)
        return
      }

      router.push(`/checkout/${data.orderId}`)
    } catch {
      setError('Falha na conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/10 bg-[#0f0f18] shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 p-5">
          <div>
            <h3 className="font-bold text-white text-base">Finalizar Compra</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatQuantity(pkg.quantity)} {pkg.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="mt-0.5 rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Package summary */}
          <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-lg flex-shrink-0">
                {getTypeIcon(pkg.categorySlug)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{pkg.name}</p>
                <p className="text-xs text-gray-400">{pkg.quantity.toLocaleString('pt-BR')} unidades</p>
              </div>
            </div>
            <span className="text-base font-bold text-white ml-2 flex-shrink-0">{formatBRL(pkg.priceBRL)}</span>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isPost ? (
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4 text-purple-400" />
                  Link do {isTikTok ? 'vídeo TikTok' : 'post ou reel'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <AtSign className="h-4 w-4 text-purple-400" />
                  Perfil do {platformLabel}
                </span>
              )}
            </label>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError('') }}
              placeholder={getPlaceholder()}
              disabled={loading}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            />

            <p className="mt-1.5 text-xs text-gray-500">{getInputHint()}</p>

            {error && (
              <div className="mt-2 flex items-start gap-1.5 text-red-400 text-xs">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-purple-400" />
                Email para confirmação
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              placeholder="seu@email.com"
              disabled={loading}
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Enviaremos a confirmação do pedido para este email
            </p>
            {emailError && (
              <div className="mt-2 flex items-start gap-1.5 text-red-400 text-xs">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Security note */}
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3 text-xs text-blue-300">
            🔒 Não pedimos senha. Perfil deve estar <strong>público</strong> para receber {isTikTok ? 'seguidores' : 'seguidores'}.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !input.trim() || !email.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:from-purple-400 hover:to-purple-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando pedido...
              </>
            ) : (
              `Ir para Pagamento — ${formatBRL(pkg.priceBRL)}`
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
