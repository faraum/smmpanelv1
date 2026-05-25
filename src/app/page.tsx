'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import CategorySection from '@/components/CategorySection'
import UsernameModal from '@/components/UsernameModal'
import FAQ from '@/components/FAQ'
import PreviewBanner from '@/components/PreviewBanner'
import { Package, categories, getPackagesBySlug } from '@/data/packages'
import { Shield, Zap, Clock, Star, Users, Heart, Eye, MessageCircle } from 'lucide-react'

export default function Home() {
  const [activeSlug, setActiveSlug] = useState(categories[0].slug)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const isPreview = process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Pulse SMM'

  const categoryIconComponents: Record<string, React.ReactNode> = {
    'seguidores-mundiais':     <Users className="h-3.5 w-3.5" />,
    'seguidores-brasileiros':  <Users className="h-3.5 w-3.5" />,
    'curtidas-mundiais':       <Heart className="h-3.5 w-3.5" />,
    'curtidas-brasileiras':    <Heart className="h-3.5 w-3.5" />,
    'visualizacoes-reels':     <Eye className="h-3.5 w-3.5" />,
    'comentarios-brasileiros': <MessageCircle className="h-3.5 w-3.5" />,
  }

  const currentPackages = getPackagesBySlug(activeSlug)
  const activeCategory = categories.find((c) => c.slug === activeSlug)

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
              Entrega automática e instantânea
            </div>

            <h1 className="mb-4 text-4xl font-black leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Comprar{' '}
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                Seguidores
              </span>{' '}
              &{' '}
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                Curtidas
              </span>{' '}
              <br className="hidden sm:block" />
              Instagram
            </h1>

            <p className="mb-8 text-base text-gray-400 max-w-xl mx-auto sm:text-lg">
              Entrega rápida, segura e 100% automática. Pagamento via PIX. Sem senha, sem risco.
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
          </div>
        </section>

        {/* Services */}
        <section id="instagram" className="px-4 pb-20">
          <div className="mx-auto max-w-7xl">
            {/* Category tabs — horizontal scroll on mobile */}
            <div className="mb-8 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeSlug === cat.slug
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/20'
                      : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
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

        <div className="px-4">
          <FAQ />
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm">{siteName} © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Todos os direitos reservados</span>
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
