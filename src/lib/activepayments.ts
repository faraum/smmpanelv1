// Client da API ActivePayments

const API_BASE = 'https://api.activepayments.com.br/api/v1'

function getAuthHeader(): string {
  const publicKey = process.env.ACTIVEPAYMENTS_PUBLIC_KEY
  const secretKey = process.env.ACTIVEPAYMENTS_SECRET_KEY
  if (!publicKey || !secretKey) throw new Error('ActivePayments keys not configured')
  return `ApiKey ${publicKey}:${secretKey}`
}

export function isActivePaymentsConfigured(): boolean {
  return !!(process.env.ACTIVEPAYMENTS_PUBLIC_KEY && process.env.ACTIVEPAYMENTS_SECRET_KEY)
}

export async function createPixCharge(params: {
  amount: number
  customerName: string
  customerCpf: string
  externalReference?: string
  postbackUrl?: string
}) {
  const response = await fetch(`${API_BASE}/charges`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      customerName: params.customerName,
      customerCpf: params.customerCpf.replace(/\D/g, ''),
      expirationMinutes: 5,
      externalReference: params.externalReference || '',
      additionalInfo: 'Hypefy - Compra de serviço digital',
      postbackUrl: params.postbackUrl || '',
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erro ao criar cobrança PIX')
  }

  // Returns: { chargeId, externalId, amount, status,
  //            pix: { qrCode, qrCodeBase64, expiresAt } }
  return data.data as {
    chargeId: string
    amount: number
    status: string
    pix: {
      qrCode: string
      qrCodeBase64: string
      expiresAt: string
    }
  }
}

export async function getChargeStatus(chargeId: string) {
  const response = await fetch(`${API_BASE}/charges/${chargeId}`, {
    headers: { Authorization: getAuthHeader() },
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erro ao consultar status')
  }

  // Returns: { chargeId, amount, status ('pending'|'paid'|'cancelled'|'failed'), paidAt }
  return data.data as {
    chargeId: string
    amount: number
    status: 'pending' | 'paid' | 'cancelled' | 'failed'
    paidAt: string | null
  }
}
