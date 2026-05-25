'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Os seguidores são reais?',
    a: 'Trabalhamos com seguidores de alta qualidade, de contas reais ou de baixo risco de queda. Para seguidores brasileiros, são perfis com foto e atividade. Para mundiais, são perfis globais de qualidade. O Instagram não consegue distinguir de seguidores orgânicos quando entregues corretamente.',
  },
  {
    q: 'E se o meu perfil estiver privado?',
    a: 'Para receber seguidores, seu perfil precisa estar PÚBLICO durante a entrega. Após receber os seguidores, você pode torná-lo privado novamente. Para curtidas, reels e comentários, o post/reel precisa estar público.',
  },
  {
    q: 'Tem garantia de reposição?',
    a: 'Sim! Oferecemos garantia de 30 dias para reposição em caso de queda nos pacotes de seguidores. Se houver perda significativa dentro desse período, entre em contato pelo WhatsApp e reporemos gratuitamente.',
  },
  {
    q: 'Qual o prazo de entrega?',
    a: 'Para curtidas e visualizações, o início é em minutos. Para seguidores, o início é em 0 a 12 horas, com entrega gradual e natural para evitar bloqueios. O prazo total varia de acordo com a quantidade: até 5K em 24h, acima disso em até 3-5 dias.',
  },
  {
    q: 'O que preciso fazer para receber?',
    a: 'Nada além de informar o @ do seu perfil ou link do post. Não pedimos senha, acesso ao app, nem nenhum dado sensível. Basta pagar via PIX e aguardar a entrega automática.',
  },
  {
    q: 'O pagamento é seguro?',
    a: 'Sim. Utilizamos PIX, o sistema oficial de pagamentos instantâneos do Banco Central do Brasil. A transação é direta entre você e nosso banco, sem intermediários. Seu QR Code tem validade de 30 minutos.',
  },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="py-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Perguntas Frequentes</h2>
        <p className="text-gray-400 text-center text-sm mb-8">Tire suas dúvidas antes de comprar</p>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/5 bg-white/5 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIdx === idx ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
