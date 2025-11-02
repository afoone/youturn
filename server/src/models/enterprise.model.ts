import mongoose, { Schema, Document } from 'mongoose'

export interface Enterprise extends Document {
  name: string
  email: string
  address: string
  phone: string
  createdAt: Date
}

const EnterpriseSchema = new Schema<Enterprise>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'enterprises' }
)

export const EnterpriseModel = mongoose.model<Enterprise>('Enterprise', EnterpriseSchema)
