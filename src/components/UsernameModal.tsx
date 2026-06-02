'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from '@/data/packages'
import { formatBRL, formatQuantity } from '@/lib/utils'
import { X, AtSign, Link as LinkIcon, Loader2, AlertCircle, MessageSquare } from 'lucide-react'

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

function validateUsername(raw: string): boolean {
  const username = raw.trim().replace(/^@/, '')
  return username.length >= 2
}

function validatePostLink(raw: string, platform: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  if (platform === 'tiktok') return trimmed.includes('tiktok.com/')
  return trimmed.includes('instagram.com/') || trimmed.includes('instagr.am/')
}

export default function UsernameModal({ pkg, onClose }: UsernameModalProps) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [postLink, setPostLink] = useState('')
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  const isPost = pkg?.inputType === 'post'
  const isTikTok = pkg?.platform === 'tiktok'
  const isComments = !!pkg?.categorySlug?.includes('comentarios')

  useEffect(() => {
    if (pkg) {
      setUsername('')
      setPostLink('')
      setComments('')
      setError('')
      setTimeout(() => usernameRef.current?.focus(), 100)
    }
  }, [pkg])

  useEffect(() => {
    if (pkg) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [pkg])

  if (!pkg) return null

  const platform = pkg.platform ?? 'instagram'
  const commentLines = comments.split('\n').filter(c => c.trim())
  const commentsFilled = commentLines.length
  const commentsNeeded = pkg.quantity

  const postPlaceholder = isTikTok
    ? 'ex: https://tiktok.com/@user/video/123'
    : 'ex: https://instagram.com/p/ABC123'

  const isSubmitDisabled =
    loading ||
    !validateUsername(username) ||
    (isPost && !validatePostLink(postLink, platform)) ||
    (isComments && commentsFilled !== commentsNeeded)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateUsername(username)) {
      setError('Informe o @ do seu perfil')
      return
    }

    if (isPost && !validatePostLink(postLink, platform)) {
      setError(`Cole o link direto do ${isTikTok ? 'vídeo TikTok' : 'post ou reel do Instagram'}`)
      return
    }

    if (isComments && commentsFilled !== commentsNeeded) {
      setError(`Escreva exatamente ${commentsNeeded} comentário${commentsNeeded > 1 ? 's' : ''} (${commentsFilled}/${commentsNeeded})`)
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          username: username.trim(),
          postLink: isPost ? postLink.trim() : undefined,
          comments: isComments ? comments.trim() : undefined,
        }),
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

          {/* Always: @ do perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-1.5">
                <AtSign className="h-4 w-4 text-purple-400" />
                Seu perfil {isTikTok ? 'TikTok' : 'Instagram'}
              </span>
            </label>
            <input
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder="ex: @seuperfil"
              disabled={loading}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Post link (likes, views, comments) */}
          {isPost && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4 text-purple-400" />
                  Link do {isTikTok ? 'vídeo TikTok' : 'post ou reel'}
                </span>
              </label>
              <input
                type="text"
                value={postLink}
                onChange={(e) => { setPostLink(e.target.value); setError('') }}
                placeholder={postPlaceholder}
                disabled={loading}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
              />
            </div>
          )}

          {/* Comments textarea */}
          {isComments && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Seus comentários (1 por linha)
                </span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => {
                  const lines = e.target.value.split('\n')
                  if (lines.length <= commentsNeeded) {
                    setComments(e.target.value)
                    setError('')
                  }
                }}
                placeholder={'Que foto linda!\nParabéns pelo conteúdo!\nAmei demais!'}
                rows={Math.min(commentsNeeded, 10)}
                disabled={loading}
                style={{ resize: 'none' }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
              />
              <p className={`mt-1 text-xs ${commentsFilled === commentsNeeded ? 'text-emerald-400' : 'text-gray-400'}`}>
                {commentsFilled} / {commentsNeeded} comentários escritos
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-1.5 text-red-400 text-xs">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Security note */}
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3 text-xs text-blue-300">
            🔒 Não pedimos senha. Perfil deve estar <strong>público</strong> para receber os serviços.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
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
