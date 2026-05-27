'use client'

export default function CTASection() {
  const scrollToPackages = () => {
    const el = document.getElementById('services')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <section className="px-4 py-12">
      <div
        className="mx-auto max-w-3xl rounded-2xl px-8 py-16 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.85), rgba(131, 24, 67, 0.85))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2 className="text-3xl font-black text-white mb-4 leading-tight">
          Pronto para viralizar? 🚀
        </h2>
        <p className="text-white/85 text-base mb-8 max-w-xl mx-auto">
          Seus concorrentes já estão na frente.{' '}
          <br className="hidden sm:block" />
          Não fique para trás! Transforme seu perfil em uma{' '}
          máquina de engajamento agora mesmo.
        </p>

        <button
          onClick={scrollToPackages}
          className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.35)',
          }}
        >
          🚀 Comprar agora
        </button>

        <p className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ⚡ Oferta por tempo limitado
        </p>
      </div>
    </section>
  )
}
