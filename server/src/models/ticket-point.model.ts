import mongoose, { Document, Schema, Types } from 'mongoose'
import { Service } from './service.model'
import { Enterprise } from './enterprise.model'

export interface TicketPoint {
  name: string
  location?: string
  enterprise: Types.ObjectId | Enterprise
  services: Array<{
    service: Types.ObjectId | Service
    priority: boolean
  }>
}

export interface TicketPointDocument extends Document, TicketPoint {}

const ticketPointSchema = new Schema<TicketPointDocument>(
  {
    name: { type: String, required: true },
    location: { type: String },
    enterprise: { type: Schema.Types.ObjectId, ref: 'Enterprise', required: true },
    services: [
      {
        service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
        priority: { type: Boolean, default: false },
      },
    ],
  },
  {
    collection: 'ticketpoints',
    timestamps: true,
  }
)

// Validación: todos los servicios deben ser de la misma empresa
ticketPointSchema.pre('validate', async function (next) {
  if (this.services && this.services.length > 0 && this.enterprise) {
    const ServiceModel = mongoose.model('Service')
    // Extraer los IDs de servicios de la nueva estructura
    const serviceIds = this.services.map((s: any) => 
      typeof s === 'object' && s.service ? s.service : s
    )
    const services = await ServiceModel.find({ _id: { $in: serviceIds } })
    
    const allSameEnterprise = services.every(
      (service: any) => service.enterprise?.toString() === this.enterprise.toString()
    )
    
    if (!allSameEnterprise) {
      next(new Error('All services must belong to the same enterprise'))
      return
    }
  }
  next()
})

export const TicketPointModel = mongoose.model<TicketPoint>('TicketPoint', ticketPointSchema)

