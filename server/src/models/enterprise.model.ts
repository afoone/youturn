import mongoose, { Schema, Document, Types } from 'mongoose'
import { Plan } from './plan.model'

export interface Enterprise extends Document {
  name: string
  email: string
  address: string
  phone: string
  plan?: Types.ObjectId | Plan
}

const EnterpriseSchema = new Schema<Enterprise>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: false },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'enterprises'
  }
)

export const EnterpriseModel = mongoose.model<Enterprise>('Enterprise', EnterpriseSchema)
