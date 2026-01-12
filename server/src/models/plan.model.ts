import mongoose, { Document, Schema } from 'mongoose'

export interface Plan {
  codigo: string
  descripcion: string
  precio: number
  detalles?: string
  maxTicketPoints: number
  maxUsuarios: number
  maxServicios: number
}

export interface PlanDocument extends Document, Plan {}

const planSchema = new Schema<PlanDocument>(
  {
    codigo: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    detalles: { type: String },
    maxTicketPoints: { type: Number, required: true, min: 0 },
    maxUsuarios: { type: Number, required: true, min: 0 },
    maxServicios: { type: Number, required: true, min: 0 },
  },
  {
    collection: 'plans',
    timestamps: true,
  }
)

export const PlanModel = mongoose.model<Plan>('Plan', planSchema)

