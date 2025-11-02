import mongoose, { Document, Schema } from 'mongoose'

import { v4 as uuidv4 } from 'uuid'
export interface Service extends Document {
  uuid: string
  name: string
  description?: string
  inputCaption?: string
  preInfoHtml?: string
  preInfoPrintText?: string
  ticketText?: string
  ticket?: boolean
  prefix: string
  color?: string
  textColor?: string
  parentId?: number
  priority?: number
  weight?: number
  pause?: boolean
  pauseReason?: string
  hideNumber?: boolean
  hideNumberReason?: string
  hideNumberTemp?: boolean
  hideNumberTempReason?: string
  hideNumberTempDate?: string
  hideNumberTempTime?: string
  tempReasonUnavailable?: string
  childrenOfService?: mongoose.Types.ObjectId[]
  parentService?: mongoose.Types.ObjectId
}

const serviceSchema = new Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  inputCaption: { type: String },
  preInfoHtml: { type: String },
  preInfoPrintText: { type: String },
  ticketText: { type: String },
  ticket: { type: Boolean, default: false },
  prefix: { type: String , required: true },
  color: { type: String },
  textColor: { type: String },
  parentId: { type: Number },
  priority: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  pause: { type: Boolean, default: false },
  pauseReason: { type: String },
  hideNumber: { type: Boolean, default: false },
  hideNumberReason: { type: String },
  hideNumberTemp: { type: Boolean, default: false },
  hideNumberTempReason: { type: String },
  hideNumberTempDate: { type: String },
  hideNumberTempTime: { type: String },
  tempReasonUnavailable: { type: String },
  childrenOfService: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  parentService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
})

export const ServiceModel = mongoose.model<Service>('Service', serviceSchema)
