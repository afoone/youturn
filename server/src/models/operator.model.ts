import mongoose, { Document, Schema } from 'mongoose'
import { Service } from './service.model'
import { Customer } from './customer.model'

export type Status = 'WORKING' | 'PAUSED' | 'LOGGED_OUT'

export interface Operator extends Document {
  positionName: string
  description?: string
  services: string[]
  pathDescription?: string // Description of the path to the operator (e.g., "2nd floor, room 201")
  customer?: Customer
}

const operatorSchema = new Schema<Operator>(
  {
    positionName: { type: String, required: true },
    description: { type: String },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    pathDescription: { type: String },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  },
  {
    collection: 'operators',
    timestamps: true,
  }
)

export const OperatorModel = mongoose.model<Operator>('Operator', operatorSchema)
