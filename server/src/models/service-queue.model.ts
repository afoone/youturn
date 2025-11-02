import mongoose, { Document, Schema, ObjectId } from 'mongoose'
import { Service } from './service.model'
import { Customer, customerSchema } from './customer.model'

export type QueueElement = {
  _id: ObjectId
  customer: Customer
  timestamp: number
  status: string
}

export interface ServiceQueue extends Document {
  _id: ObjectId
  service: Service
  queue: QueueElement[]
  count: number
}

const serviceQueueSchema = new Schema<ServiceQueue>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    queue: [
      {
        customer: customerSchema, // aquí uso el schema embebido
        timestamp: { type: Number, required: true },
        status: { type: String, required: true },
      },
    ],
    count: { type: Number, required: true, default: 0 },
  },
  { collection: 'serviceQueues' }
)

export const ServiceQueueModel = mongoose.model<ServiceQueue>(
  'ServiceQueue',
  serviceQueueSchema
)
