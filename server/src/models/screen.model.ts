import mongoose, { Document, Schema } from 'mongoose'
import { Service } from './service.model'

export interface Screen {
  name: string
  location?: string
  resolutionWidth?: number
  resolutionHeight?: number
  services?: Service[]
}

export interface ScreenDocument extends Document, Screen {}

const screenSchema = new Schema<ScreenDocument>(
  {
    name: { type: String, required: true },
    location: { type: String },
    resolutionWidth: { type: Number },
    resolutionHeight: { type: Number },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  },
  {
    collection: 'screens',
    timestamps: true,
  }
)

export const ScreenModel = mongoose.model<Screen>('Screen', screenSchema)
