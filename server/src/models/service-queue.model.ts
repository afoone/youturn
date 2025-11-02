import mongoose, { Document, Schema, Types } from 'mongoose'
import { Service } from './service.model'
import { Customer } from './customer.model'

// 1️⃣ Tipo “puro” de la cola
export type QueueElement = {
  _id: Types.ObjectId
  customer: Types.ObjectId  // guardamos solo referencia
  timestamp: number
  status: string
}

// 2️⃣ Tipo “puro” de ServiceQueue (sin métodos de Mongoose)
export interface ServiceQueue {
  service: Types.ObjectId
  queue: QueueElement[]
  count: number
}

// 3️⃣ Tipo del documento de Mongoose
export interface ServiceQueueDocument extends ServiceQueue, Document {}

// 4️⃣ Schema de Mongoose
const serviceQueueSchema = new Schema<ServiceQueueDocument>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    queue: [
      {
        customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        timestamp: { type: Number, required: true },
        status: { type: String, required: true },
      },
    ],
    count: { type: Number, required: true, default: 0 },
  },
  { collection: 'serviceQueues' }
)

// 5️⃣ Modelo de Mongoose
export const ServiceQueueModel = mongoose.model<ServiceQueueDocument>(
  'ServiceQueue',
  serviceQueueSchema
)
