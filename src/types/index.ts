export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'

export interface BulkService {
  service: number
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
}

export interface BulkOrderStatus {
  charge: string
  start_count: string
  status: string
  remains: string
  currency: string
}

export interface BulkBalance {
  balance: string
  currency: string
}

export interface IOrder {
  orderId: string
  bulkOrderId?: number
  serviceId: number
  serviceName: string
  category: string
  quantity: number
  instagramUser: string
  instagramLink: string
  priceUSD: number
  priceBRL: number
  status: OrderStatus
  pixCode?: string
  pixQrCode?: string
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
  preview?: boolean
}

export interface AdminStats {
  totalOrders: number
  todayOrders: number
  totalRevenueBRL: number
  pendingOrders: number
  completedOrders: number
  bulkBalance?: string
  bulkCurrency?: string
  preview?: boolean
}
