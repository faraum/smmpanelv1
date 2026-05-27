'use client'

import Script from 'next/script'

const testimonials = [
  {
    name: 'Ana',
    subtitle: 'Cliente satisfeita',
    vimeoId: '1177082450',
    color: '#E91E8C',
    paddingTop: '177.78%',
    title: 'Depoimento Ana',
  },
  {
    name: 'Camila',
    subtitle: 'Cliente satisfeita',
    vimeoId: '1177429822',
    color: '#9B59B6',
    paddingTop: '177.78%',
    title: 'Depoimento Camila',
  },
  {
    name: 'Flavio',
    subtitle: 'Cliente satisfeito',
    vimeoId: '1177117255',
    color: '#8B5CF6',
    paddingTop: '179.1%',
    title: 'Depoimento Flavio',
  },
]

export default function TestimonialVideos() {
  return (
    <section className="py-16 px-4">
      <Script
        src="https://player.vimeo.com/api/player.js"
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8B5CF6' }}>
            Depoimentos Reais
          </p>
          <h2 className="text-2xl font-bold text-white mb-2">
            Veja o vídeo de alguns dos clientes{' '}
            <br className="hidden sm:block" />
            que compraram com a gente 👇
          </h2>
          <p className="text-sm text-gray-400">
            Resultados reais de quem já turbinou o perfil. Confira abaixo.
          </p>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.vimeoId}
              className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
              style={{ borderRadius: '16px' }}
            >
              {/* Badge #1 #2 #3 */}
              <div
                className="absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #E91E8C, #8B5CF6)' }}
              >
                #{i + 1}
              </div>

              {/* Video */}
              <div style={{ padding: `${t.paddingTop} 0 0 0`, position: 'relative' }}>
                <iframe
                  src={`https://player.vimeo.com/video/${t.vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px 16px 0 0',
                  }}
                  title={t.title}
                />
              </div>

              {/* Info below video */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
