import { Schema, model, Document, Types } from 'mongoose'
import { Enterprise } from './enterprise.model'
import { Service } from './service.model'
import { Operator } from './operator.model'

export interface User extends Document {
  email: string
  password: string // SHA3 hash
  nombre?: string
  apellidos?: string
  comentario?: string
  roles: string[]
  admin: boolean
  enterprise?: Types.ObjectId | Enterprise
  services?: Types.ObjectId[] | Service[] // Servicios asociados (para usuarios OPERATOR)
  operator?: Types.ObjectId | Operator // Puesto/Operator asociado (para usuarios OPERATOR)
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: false },
    apellidos: { type: String, required: false },
    comentario: { type: String, required: false },
    roles: { type: [String], default: [] },
    admin: { type: Boolean, default: false },
    enterprise: { type: Schema.Types.ObjectId, ref: 'Enterprise', required: false },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service', required: false }],
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Validación: enterprise es requerido si admin es false
userSchema.pre('validate', function (next) {
  if (!this.admin && !this.enterprise) {
    next(new Error('Enterprise is required for non-admin users'))
  } else {
    next()
  }
})

// Validación: usuarios OPERATOR deben tener enterprise y pueden tener servicios y operator
// usuarios ENTERPRISE_ADMIN deben tener enterprise pero no servicios ni operator
userSchema.pre('validate', function (next) {
  const isOperator = this.roles && this.roles.includes('OPERATOR')
  const isEnterpriseAdmin = this.roles && this.roles.includes('ENTERPRISE_ADMIN')
  
  if (isOperator && !this.enterprise) {
    next(new Error('Enterprise is required for OPERATOR users'))
  } else if (isEnterpriseAdmin && !this.enterprise) {
    next(new Error('Enterprise is required for ENTERPRISE_ADMIN users'))
  } else {
    next()
  }
})

export const UserModel = model<User>('User', userSchema)

