// customer.model.ts
import { Schema } from 'mongoose'
import { Service } from './service.model'

export interface Customer {
  queuedTime: number
  inputData?: string
  serviceId: string
  service: Service
  status: 'QUEUED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'RECALLED' | 'CALLED'
  comments?: string
  postponedStatus?: string
  postponPeriod?: number
  postponedBy?: string
  isMine?: number
  recallCount?: number
  startPostpone?: number
  finishPostpone?: number
  complexId?: number[][][]
  language?: 'en' | 'es' | 'fr' | 'de'
  extraData?: string
  orderInQueue?: number
  ticketNumber?: string
}

export const customerSchema = new Schema<Customer>(
  {
    queuedTime: { type: Number, required: true },
    inputData: String,
    serviceId: { type: String, required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, required: true },
    comments: String,
    postponedStatus: String,
    postponPeriod: Number,
    postponedBy: String,
    isMine: Number,
    recallCount: Number,
    startPostpone: Number,
    finishPostpone: Number,
    complexId: [[[Number]]],
    language: { type: String, enum: ['en', 'es', 'fr', 'de'], default: 'en' },
    extraData: String,
    orderInQueue: Number,
    ticketNumber: String,
  },
  { _id: false } // 👈 clave: no genera _id nuevo para subdocumentos
)
