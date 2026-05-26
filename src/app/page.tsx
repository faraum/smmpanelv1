'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import CategorySection from '@/components/CategorySection'
import CategoryCard from '@/components/CategoryCard'
import UsernameModal from '@/components/UsernameModal'
import FAQ from '@/components/FAQ'
import PreviewBanner from '@/components/PreviewBanner'
import { Package, instagramSubCategories, tiktokSubCategories, getPackagesBySlug } from '@/data/packages'
import { Shield, Zap, Clock, Star } from 'lucide-react'

export default function Home() {
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram')
  const [activeSlug, setActiveSlug] = useState(instagramSubCategories[0].slug)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const servicesRef = useRef<HTMLElement>(null)
  const packagesRef = useRef<HTMLDivElement>(null)

  const isPreview = process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Hypefy'

  const [orderCount, setOrderCount] = useState(190432)
  const orderTimerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    const schedule = () => {
      orderTimerRef.current = setTimeout(() => {
        setOrderCount((c) => c + 1)
        schedule()
      }, 20000 + Math.random() * 20000)
    }
    schedule()
    return () => clearTimeout(orderTimerRef.current)
  }, [])

  // Listen for platform change events from header
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<'instagram' | 'tiktok'>).detail
      setPlatform(detail)
      const cats = detail === 'tiktok' ? tiktokSubCategories : instagramSubCategories
      setActiveSlug(cats[0].slug)
      setTimeout(() => {
        servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    window.addEventListener('hypefy:platform', handler)
    return () => window.removeEventListener('hypefy:platform', handler)
  }, [])

  const currentCategories = platform === 'tiktok' ? tiktokSubCategories : instagramSubCategories
  const currentPackages = getPackagesBySlug(activeSlug)
  const activeCategory = currentCategories.find((c) => c.slug === activeSlug)

  const handlePlatformSwitch = (p: 'instagram' | 'tiktok') => {
    setPlatform(p)
    const cats = p === 'tiktok' ? tiktokSubCategories : instagramSubCategories
    setActiveSlug(cats[0].slug)
  }

  const handleCategoryCardClick = (slug: string) => {
    setActiveSlug(slug)
    setTimeout(() => {
      packagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const isTikTok = platform === 'tiktok'

  return (
    <>
      <Header />
      {isPreview && <PreviewBanner />}

      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4 sm:pt-36 sm:pb-20">
          {/* Animated background glow */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-purple-700/8 blur-[140px]" />
            <div className="absolute top-32 right-1/4 h-[400px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm text-purple-300">
              <Zap className="h-3.5 w-3.5 fill-purple-400 text-purple-400" />
              ⚡ Entrega automática e instantânea
            </div>

            <h1 className="mb-4 text-4xl font-black leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Comprar{' '}
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                Seguidores
              </span>{' '}
              &{' '}
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                Curtidas
              </span>
              <br className="hidden sm:block" />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-300 mt-1 block">
                Instagram & TikTok
              </span>
            </h1>

            <p className="mb-4 text-base text-gray-400 max-w-xl mx-auto sm:text-lg">
              Entrega rápida, segura e 100% automática. Pagamento via PIX. Sem senha, sem risco.
            </p>

            <p className="mb-8 text-sm font-medium" style={{ color: '#8B5CF6' }}>
              Crie o hype que você merece
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: <Shield className="h-3.5 w-3.5" />, text: 'Sem senha' },
                { icon: <Zap className="h-3.5 w-3.5" />, text: '100% Seguro' },
                { icon: <Clock className="h-3.5 w-3.5" />, text: 'Entrega rápida' },
                { icon: <Star className="h-3.5 w-3.5 fill-current" />, text: 'Garantia 30 dias' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
                >
                  <span className="text-purple-400">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Order counter */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="text-base">🔥</span>
              <span className="text-sm text-gray-400">
                <span className="font-semibold text-white">
                  +{orderCount.toLocaleString('pt-BR')}
                </span>{' '}
                pedidos entregues com sucesso
              </span>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" ref={servicesRef} className="px-4 pb-20">
          <div className="mx-auto max-w-7xl">

            {/* Platform Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 gap-1">
                <button
                  onClick={() => handlePlatformSwitch('instagram')}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    !isTikTok
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </button>
                <button
                  onClick={() => handlePlatformSwitch('tiktok')}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                    isTikTok
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z" />
                  </svg>
                  TikTok
                </button>
              </div>
            </div>

            {/* Category Cards — horizontal scroll on mobile, grid on desktop */}
            <div className="mb-10 -mx-4 px-4 flex gap-3 overflow-x-auto pb-3 no-scrollbar sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
              {currentCategories.map((cat, i) => {
                const pkgs = getPackagesBySlug(cat.slug)
                return (
                  <CategoryCard
                    key={cat.slug}
                    category={cat}
                    packages={pkgs}
                    featured={i === 0}
                    active={activeSlug === cat.slug}
                    onClick={() => handleCategoryCardClick(cat.slug)}
                  />
                )
              })}
            </div>

            {/* Sub-category tabs */}
            <div ref={packagesRef} className="mb-6 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
              {currentCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 border ${
                    activeSlug === cat.slug
                      ? isTikTok
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white border-transparent shadow-lg shadow-pink-500/20'
                        : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white border-transparent shadow-lg shadow-purple-500/20'
                      : 'border-white/15 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/25'
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Category heading */}
            {activeCategory && (
              <div className="mb-5 flex items-center gap-2">
                <span className="text-xl">{activeCategory.icon}</span>
                <h2 className="text-lg font-bold text-white">{activeCategory.name}</h2>
                <span className="text-xs text-gray-500 ml-1">
                  ({currentPackages.length} pacotes)
                </span>
              </div>
            )}

            <CategorySection packages={currentPackages} onBuy={setSelectedPackage} />
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/5 py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white">Por que escolher o {siteName}?</h2>
              <p className="text-gray-400 text-sm mt-2">Qualidade garantida em cada pedido</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: '⚡', title: 'Entrega Rápida', desc: 'Curtidas e views em minutos. Seguidores começam em até 1 hora após o pagamento confirmado.' },
                { icon: '🔒', title: 'Sem Senha', desc: 'Nunca pedimos sua senha. Apenas o @ ou link do perfil/post é necessário para entrega.' },
                { icon: '💳', title: 'PIX Instantâneo', desc: 'Pagamento 100% brasileiro via PIX. Rápido, seguro e sem taxas escondidas.' },
                { icon: '🛡️', title: 'Garantia 30 Dias', desc: 'Em caso de queda nos seguidores, repomos gratuitamente dentro de 30 dias da compra.' },
                { icon: '🇧🇷', title: 'Opções Brasileiras', desc: 'Seguidores e curtidas de perfis brasileiros reais para engajamento mais qualificado.' },
                { icon: '🤝', title: 'Suporte WhatsApp', desc: 'Atendimento pelo WhatsApp para acompanhar seu pedido e tirar qualquer dúvida.' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/5 p-5 hover:border-white/10 transition-colors"
                >
                  <div className="mb-3 text-2xl">{f.icon}</div>
                  <h3 className="mb-1.5 font-bold text-white text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="faq" className="px-4">
          <FAQ />
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.5px' }}>
                <span style={{ color: '#8B5CF6' }}>Hype</span>
                <span style={{ color: '#ffffff' }}>fy</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>© 2025 Hypefy. Todos os direitos reservados.</span>
              {process.env.NEXT_PUBLIC_WHATSAPP && (
                <>
                  <span>·</span>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`}
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        </footer>
      </main>

      {/* Purchase modal */}
      <UsernameModal
        pkg={selectedPackage}
        onClose={() => setSelectedPackage(null)}
      />
    </>
  )
}
