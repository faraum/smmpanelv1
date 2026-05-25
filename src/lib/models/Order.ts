import mongoose, { Schema, Document, Model } from 'mongoose'
import { OrderStatus } from '@/types'

export interface IOrderDocument extends Document {
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
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    bulkOrderId: { type: Number, default: null },
    serviceId: { type: Number, required: true },
    serviceName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    instagramUser: { type: String, required: true },
    instagramLink: { type: String, required: true },
    priceUSD: { type: Number, required: true, default: 0 },
    priceBRL: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING_PAYMENT',
    },
    pixCode: { type: String, default: null },
    pixQrCode: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

// Evitar recompilação do model em hot-reload (dev mode)
const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema)

export default Order
