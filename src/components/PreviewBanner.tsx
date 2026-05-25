'use client'

import { Eye } from 'lucide-react'

export default function PreviewBanner() {
  return (
    <div className="sticky top-16 z-40 flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300">
      <Eye className="h-3.5 w-3.5 flex-shrink-0" />
      <span>
        <strong>Modo Preview</strong> — Os dados exibidos são fictícios. Configure as variáveis de ambiente para ativar o modo produção.
      </span>
    </div>
  )
}
