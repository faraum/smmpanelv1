import QRCode from 'qrcode'

/**
 * Gera um código PIX copia-e-cola (placeholder).
 * SUBSTITUIR pela integração real com Mercado Pago, Asaas, PagSeguro, etc.
 */
export function generatePixCode(amount: number, description: string): string {
  // Formato PIX estático simplificado (placeholder visual)
  // Em produção, usar a biblioteca EMV para gerar o payload correto
  const pixKey = process.env.PIX_KEY || '00000000000'
  const amountFormatted = amount.toFixed(2)

  // Payload PIX simplificado (não é válido para pagamento real, apenas visual)
  const payload = [
    '000201',                                    // Payload Format Indicator
    '26580014BR.GOV.BCB.PIX',                    // Merchant Account Information
    `0136${pixKey.padEnd(36, '0').slice(0, 36)}`, // PIX key (36 chars)
    '52040000',                                   // Merchant Category Code
    '5303986',                                    // Transaction Currency (BRL)
    `5406${amountFormatted.replace('.', '')}`,    // Transaction Amount
    '5802BR',                                     // Country Code
    '5906Hypefy',                                 // Merchant Name
    '6009SAO PAULO',                              // Merchant City
    `62070503${description.slice(0, 3)}`,         // Additional Data
    '6304',                                       // CRC placeholder
  ].join('')

  return `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865406${amountFormatted.replace('.', '').padStart(6, '0')}5802BR5906Hypefy5009Sao Paulo62070503${Date.now().toString().slice(-3)}6304ABCD`
}

/**
 * Gera QR Code como string base64 a partir de um texto.
 * Usa a biblioteca 'qrcode' — gera QR real e escaneável.
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    return qrDataUrl
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error)
    throw new Error('Falha ao gerar QR Code')
  }
}

/**
 * Gera PIX completo: código + QR Code base64
 */
export async function generatePixPayment(
  amount: number,
  orderId: string
): Promise<{ pixCode: string; pixQrCode: string }> {
  const pixCode = generatePixCode(amount, orderId)
  const pixQrCode = await generateQRCode(pixCode)

  return { pixCode, pixQrCode }
}
