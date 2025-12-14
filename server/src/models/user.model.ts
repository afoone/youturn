import { Schema, model, Document, Types } from 'mongoose'
import { Enterprise } from './enterprise.model'

export interface User extends Document {
  username: string
  email: string
  password: string // SHA3 hash
  roles: string[]
  admin: boolean
  enterprise?: Types.ObjectId | Enterprise
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: [String], default: [] },
    admin: { type: Boolean, default: false },
    enterprise: { type: Schema.Types.ObjectId, ref: 'Enterprise', required: false },
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

export const UserModel = model<User>('User', userSchema)

