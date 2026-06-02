import { BulkService, BulkOrderStatus, BulkBalance } from '@/types'

const API_URL = 'https://bulkfollows.com/api/v2'

class BulkFollowsClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(params: Record<string, string | number>): Promise<T> {
    const body = new URLSearchParams()
    body.append('key', this.apiKey)

    for (const [key, value] of Object.entries(params)) {
      body.append(key, String(value))
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error(`BulkFollows API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`BulkFollows error: ${data.error}`)
    }

    return data as T
  }

  async getServices(): Promise<BulkService[]> {
    return this.request<BulkService[]>({ action: 'services' })
  }

  async createOrder(serviceId: number, link: string, quantity: number, comments?: string): Promise<{ order: number }> {
    const params: Record<string, string | number> = {
      action: 'add',
      service: serviceId,
      link,
      quantity,
    }
    if (comments) {
      params.comments = comments
    }
    return this.request<{ order: number }>(params)
  }

  async getOrderStatus(orderId: number): Promise<BulkOrderStatus> {
    return this.request<BulkOrderStatus>({
      action: 'status',
      order: orderId,
    })
  }

  async getMultipleOrderStatus(orderIds: number[]): Promise<Record<string, BulkOrderStatus>> {
    return this.request<Record<string, BulkOrderStatus>>({
      action: 'status',
      orders: orderIds.join(','),
    })
  }

  async getBalance(): Promise<BulkBalance> {
    return this.request<BulkBalance>({ action: 'balance' })
  }
}

// Singleton — criado somente no servidor
let client: BulkFollowsClient | null = null

export function getBulkFollowsClient(): BulkFollowsClient {
  if (!process.env.BULKFOLLOWS_API_KEY) {
    throw new Error('BULKFOLLOWS_API_KEY não definida')
  }

  if (!client) {
    client = new BulkFollowsClient(process.env.BULKFOLLOWS_API_KEY)
  }

  return client
}

export default BulkFollowsClient
