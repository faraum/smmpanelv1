import { getBulkFollowsClient } from './bulkfollows'
import { getServiceId } from './service-ids'

export interface OrderPayload {
  orderId: string
  platform: 'instagram' | 'tiktok'
  serviceType: 'followers' | 'likes' | 'views' | 'stories' | 'comments'
  region: 'global' | 'brazil'
  quantity: number
  instagramLink: string
  username: string
  bumpQty?: number
  comments?: string
}

export async function processOrderAfterPayment(order: OrderPayload): Promise<{
  success: boolean
  bulkOrderId?: number
  error?: string
}> {
  if (!process.env.BULKFOLLOWS_API_KEY) {
    console.log('[BulkFollows] BULKFOLLOWS_API_KEY não configurada — pulando criação do pedido')
    return { success: false, error: 'BULKFOLLOWS_API_KEY não configurada' }
  }

  try {
    const serviceId = getServiceId(order.platform, order.serviceType, order.region)

    console.log('=== PROCESSANDO PEDIDO ===')
    console.log('Platform:', order.platform)
    console.log('ServiceType:', order.serviceType)
    console.log('Region:', order.region)
    console.log('Quantity:', order.quantity)
    console.log('Link:', order.instagramLink)
    console.log('Username:', order.username)
    console.log('Comments:', order.comments ? `SIM (${order.comments.split('\n').length} linhas)` : 'NÃO')
    console.log('ServiceId encontrado:', serviceId)

    if (!serviceId) {
      const msg = `Serviço não mapeado: ${order.platform}/${order.serviceType}/${order.region}`
      console.error(`[BulkFollows] ${msg}`)
      return { success: false, error: msg }
    }

    const client = getBulkFollowsClient()
    const result = await client.createOrder(serviceId, order.instagramLink, order.quantity, order.comments)

    console.log(`[BulkFollows] ✅ Pedido criado! bulkOrderId:${result.order} ref:${order.orderId}`)

    // Process bump followers as separate order using the profile link (non-critical)
    if (order.bumpQty && order.bumpQty > 0) {
      try {
        const bumpServiceId = getServiceId(order.platform, 'followers', 'global')
        const rawUser = (order.username || '').replace(/^@/, '')
        const bumpLink = order.platform === 'tiktok'
          ? `https://www.tiktok.com/@${rawUser}`
          : `https://www.instagram.com/${rawUser}/`

        if (bumpServiceId && rawUser) {
          await client.createOrder(bumpServiceId, bumpLink, order.bumpQty)
          console.log(`[BulkFollows] ✅ Bump criado! qty:${order.bumpQty} link:${bumpLink}`)
        } else {
          console.warn(`[BulkFollows] Bump ignorado — bumpServiceId:${bumpServiceId} rawUser:"${rawUser}"`)
        }
      } catch (bumpErr) {
        console.error('[BulkFollows] Erro no bump (não crítico):', bumpErr)
      }
    }

    return { success: true, bulkOrderId: result.order }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[BulkFollows] Erro ao processar pedido:', msg)
    return { success: false, error: msg }
  }
}
