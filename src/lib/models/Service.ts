import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IServiceDocument extends Document {
  serviceId: number
  name: string
  category: string
  type: string
  rate: number
  min: number
  max: number
  priceBRL?: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    serviceId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    rate: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    priceBRL: { type: Number, default: null },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

const Service: Model<IServiceDocument> =
  mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema)

export default Service
