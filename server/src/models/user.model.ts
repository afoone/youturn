import { Schema, model, Document } from 'mongoose'

export interface User extends Document {
  username: string
  email: string
  password: string // SHA3 hash
  roles: string[]
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
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const UserModel = model<User>('User', userSchema)

