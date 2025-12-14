import mongoose, { Schema, Document } from 'mongoose'

export interface Enterprise extends Document {
  name: string
  email: string
  address: string
  phone: string
}

const EnterpriseSchema = new Schema<Enterprise>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'enterprises'
  }
)

export const EnterpriseModel = mongoose.model<Enterprise>('Enterprise', EnterpriseSchema)
