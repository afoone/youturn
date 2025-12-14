import { Schema, model, Document, Types } from 'mongoose'
import { Service } from './service.model'
import { Operator } from './operator.model'

// Interfaz pura de dominio
export interface Customer {
  queuedTime: number
  inputData?: string
  serviceId: string
  service: Types.ObjectId | Service
  status: 'QUEUED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'RECALLED' | 'CALLING'
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
  operator?: Types.ObjectId | Operator
  priority?: boolean
}

// Documento de Mongoose (incluye _id y métodos)
export interface CustomerDocument extends Customer, Document {}

// Schema
const customerSchema = new Schema<CustomerDocument>(
  {
    queuedTime: { type: Number, required: true },
    inputData: String,
    serviceId: { type: String, required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    status: {
      type: String,
      enum: ['QUEUED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'RECALLED', 'CALLING'],
      required: true,
    },
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
    operator: { type: Schema.Types.ObjectId, ref: 'Operator' },
    priority: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const CustomerModel = model<CustomerDocument>('Customer', customerSchema)
