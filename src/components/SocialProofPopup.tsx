'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

const socialProofs = [
  { name: 'Flávia Paixão', action: 'Comprou seguidores para seu Instagram', time: 'Agora' },
  { name: 'Alan Soares', action: 'Comprou curtidas para sua publicação', time: '2min atrás' },
  { name: 'Marjorie Oliveira', action: 'Comprou 1.000 seguidores brasileiros', time: '3min atrás' },
  { name: 'Lucas Ferreira', action: 'Comprou visualizações para seu Reels', time: '5min atrás' },
  { name: 'Camila Santos', action: 'Comprou 500 curtidas brasileiras', time: 'Agora' },
  { name: 'Rafael Costa', action: 'Comprou 5.000 seguidores mundiais', time: '1min atrás' },
  { name: 'Juliana Mendes', action: 'Comprou comentários brasileiros', time: '4min atrás' },
  { name: 'Pedro Henrique', action: 'Comprou 2.000 seguidores brasileiros', time: '2min atrás' },
  { name: 'Amanda Rodrigues', action: 'Comprou 10.000 visualizações Reels', time: 'Agora' },
  { name: 'Thiago Almeida', action: 'Comprou 3.000 seguidores mundiais', time: '6min atrás' },
  { name: 'Beatriz Lima', action: 'Comprou curtidas para seu post', time: '1min atrás' },
  { name: 'Gabriel Nascimento', action: 'Comprou 500 seguidores brasileiros', time: '3min atrás' },
  { name: 'Isabela Martins', action: 'Comprou 50 comentários brasileiros', time: 'Agora' },
  { name: 'Diego Barbosa', action: 'Comprou 100.000 visualizações Reels', time: '5min atrás' },
  { name: 'Larissa Araújo', action: 'Comprou 1.000 curtidas mundiais', time: '2min atrás' },
  { name: 'Mateus Silva', action: 'Comprou 10.000 seguidores mundiais', time: '4min atrás' },
  { name: 'Carolina Souza', action: 'Comprou seguidores brasileiros', time: 'Agora' },
  { name: 'Vinícius Rocha', action: 'Comprou 5.000 curtidas brasileiras', time: '1min atrás' },
  { name: 'Fernanda Oliveira', action: 'Comprou 20.000 visualizações', time: '7min atrás' },
  { name: 'Bruno Carvalho', action: 'Comprou 3.000 seguidores brasileiros', time: '3min atrás' },
]

export default function SocialProofPopup() {
  const pathname = usePathname()
  const [current, setCurrent] = useState<(typeof socialProofs)[0] | null>(null)
  const [show, setShow] = useState(false)
  const [entering, setEntering] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const shouldShow =
    !pathname?.startsWith('/checkout') && !pathname?.startsWith('/status')

  const showOne = useCallback(() => {
    const proof = socialProofs[Math.floor(Math.random() * socialProofs.length)]
    setCurrent(proof)
    setEntering(false)
    setShow(true)
    // Trigger enter animation on next frame
    setTimeout(() => setEntering(true), 16)
    // Start exit after 4s
    setTimeout(() => {
      setEntering(false)
      setTimeout(() => setShow(false), 350)
    }, 4000)
  }, [])

  useEffect(() => {
    if (!shouldShow) return

    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 4000 // 8–12 s
      timeoutRef.current = setTimeout(() => {
        showOne()
        scheduleNext()
      }, delay)
    }

    // First show after 3 s
    timeoutRef.current = setTimeout(() => {
      showOne()
      scheduleNext()
    }, 3000)

    return () => clearTimeout(timeoutRef.current)
  }, [shouldShow, showOne])

  if (!shouldShow || !show || !current) return null

  return (
    <div
      className={`fixed top-16 left-4 z-30 w-[calc(100vw-2rem)] max-w-[300px] transition-all duration-300 ease-out ${
        entering ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-purple-500/20 bg-[#0f0f1a]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {/* Instagram icon */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)' }}
        >
          {/* Instagram SVG icon */}
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="white" stroke="none" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[11px] font-semibold text-gray-400">Instagram</span>
            <span className="text-[10px] text-gray-600 flex-shrink-0">{current.time}</span>
          </div>
          <p className="text-xs font-bold text-white leading-snug">{current.name}</p>
          <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{current.action}</p>
        </div>
      </div>
    </div>
  )
}
