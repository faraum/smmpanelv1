import { getBulkFollowsClient } from './bulkfollows'
import { getServiceId } from './service-ids'

export interface OrderPayload {
  orderId: string
  platform: 'instagram' | 'tiktok'
  serviceType: 'followers' | 'likes' | 'views' | 'comments'
  region: 'global' | 'brazil'
  quantity: number
  instagramLink: string
  bumpQty?: number
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

    if (!serviceId) {
      const msg = `Serviço não mapeado: ${order.platform}/${order.serviceType}/${order.region}`
      console.error(`[BulkFollows] ${msg}`)
      return { success: false, error: msg }
    }

    console.log(`[BulkFollows] Serviço: ${order.platform} ${order.serviceType} ${order.region} → ID: ${serviceId}`)

    const client = getBulkFollowsClient()
    const result = await client.createOrder(serviceId, order.instagramLink, order.quantity)

    console.log(`[BulkFollows] ✅ Pedido criado! bulkOrderId:${result.order} ref:${order.orderId}`)

    // Process bump followers as a separate order (non-critical)
    if (order.bumpQty && order.bumpQty > 0) {
      try {
        const bumpServiceId = getServiceId(order.platform, 'followers', 'global')
        if (bumpServiceId) {
          await client.createOrder(bumpServiceId, order.instagramLink, order.bumpQty)
          console.log(`[BulkFollows] ✅ Bump criado! qty:${order.bumpQty}`)
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
