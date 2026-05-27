import { getBulkFollowsClient } from './bulkfollows'
import { findCheapestService } from './service-mapper'

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
    const service = await findCheapestService({
      platform: order.platform,
      type: order.serviceType,
      region: order.region,
      quantity: order.quantity,
    })

    if (!service) {
      const msg = `Nenhum serviço encontrado: ${order.platform} ${order.serviceType} ${order.region} qty:${order.quantity}`
      console.error(`[BulkFollows] ${msg}`)
      return { success: false, error: msg }
    }

    console.log(
      `[BulkFollows] Serviço: "${service.name}" (id:${service.serviceId} $${service.rate}/1K)`
    )

    const client = getBulkFollowsClient()
    const result = await client.createOrder(service.serviceId, order.instagramLink, order.quantity)

    console.log(
      `[BulkFollows] ✅ Pedido criado! bulkOrderId:${result.order} ref:${order.orderId}`
    )

    // Process bump followers as a separate order (non-critical)
    if (order.bumpQty && order.bumpQty > 0) {
      try {
        const bumpService = await findCheapestService({
          platform: order.platform,
          type: 'followers',
          region: 'global',
          quantity: order.bumpQty,
        })
        if (bumpService) {
          await client.createOrder(bumpService.serviceId, order.instagramLink, order.bumpQty)
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
