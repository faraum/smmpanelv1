import { getBulkFollowsClient } from './bulkfollows'
import { getServiceId } from './service-ids'
import { TEST_MODE } from '@/data/packages'

export interface OrderPayload {
  orderId: string
  platform: string
  serviceType: string
  region: string
  quantity: number
  instagramLink: string
  username: string
  comments?: string
  orderBumps?: Array<{ quantity: number }>
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
    console.log('OrderBumps:', order.orderBumps?.length ?? 0)
    console.log('ServiceId encontrado:', serviceId)

    if (!serviceId) {
      const msg = `Serviço não mapeado: ${order.platform}/${order.serviceType}/${order.region}`
      console.error(`[BulkFollows] ${msg}`)
      return { success: false, error: msg }
    }

    const client = getBulkFollowsClient()

    // Build the correct link for the main order
    // For followers/stories the instagramLink is already the profile URL
    // For likes/views/comments it is the post URL
    const mainLink = order.instagramLink || (() => {
      const user = order.username.replace(/^@/, '')
      return order.platform === 'tiktok'
        ? `https://www.tiktok.com/@${user}`
        : `https://www.instagram.com/${user}/`
    })()

    // TEST_MODE: comentários → 5 unidades + 5 primeiras linhas; outros → 100
    const isComments = order.serviceType === 'comments'
    const effectiveQuantity = TEST_MODE
      ? (isComments ? 5 : 100)
      : order.quantity
    const effectiveComments = (TEST_MODE && isComments && order.comments)
      ? order.comments.split('\n').slice(0, 5).join('\n')
      : order.comments
    const result = await client.createOrder(serviceId, mainLink, effectiveQuantity, effectiveComments)
    console.log(`[BulkFollows] ✅ Pedido criado! bulkOrderId:${result.order} ref:${order.orderId}`)

    // Process order bumps (always on the profile link)
    if (order.orderBumps && order.orderBumps.length > 0) {
      const bumpServiceId = getServiceId(order.platform, 'followers', 'global')
      const rawUser = order.username.replace(/^@/, '')
      const bumpLink = order.platform === 'tiktok'
        ? `https://www.tiktok.com/@${rawUser}`
        : `https://www.instagram.com/${rawUser}/`

      for (const bump of order.orderBumps) {
        try {
          if (bumpServiceId) {
            await client.createOrder(bumpServiceId, bumpLink, bump.quantity)
            console.log(`[BulkFollows] ✅ Bump criado! qty:${bump.quantity} link:${bumpLink}`)
          }
        } catch (bumpErr) {
          console.error('[BulkFollows] Erro no bump (não crítico):', bumpErr)
        }
      }
    }

    return { success: true, bulkOrderId: result.order }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[BulkFollows] Erro ao processar pedido:', msg)
    return { success: false, error: msg }
  }
}
