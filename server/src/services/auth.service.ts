import { Types } from 'mongoose'
import { User } from '../models/user.model'
import { userProvider } from '../providers/user.provider'
import { hashPassword, verifyPassword } from '../utils/crypto.util'
import { generateToken, JwtPayload } from '../utils/jwt.util'

class AuthService {
  async register(email: string, password: string, roles: string[] = [], enterpriseId?: string, admin: boolean = false, nombre?: string, apellidos?: string, comentario?: string): Promise<{ user: User; token: string }> {
    // Verificar si el usuario ya existe
    const existingEmail = await userProvider.getUserByEmail(email)
    if (existingEmail) {
      throw new Error('Email already exists')
    }

    // Validar: si no es admin, debe tener enterprise
    if (!admin && !enterpriseId) {
      throw new Error('Enterprise is required for non-admin users')
    }

    // Hash de la contraseña
    const hashedPassword = hashPassword(password)

    // Crear usuario
    const user = await userProvider.createUser({
      email,
      password: hashedPassword,
      nombre,
      apellidos,
      comentario,
      roles: roles.length > 0 ? roles : [],
      admin,
      enterprise: enterpriseId ? new Types.ObjectId(enterpriseId) : undefined,
      active: true,
    })

    // Generar token
    const userId = String((user as any)._id)
    const payload: JwtPayload = {
      userId,
      email: user.email,
      roles: user.roles,
      admin: user.admin,
      enterpriseId: user.enterprise ? String((user.enterprise as any)._id || user.enterprise) : undefined,
    }
    const token = generateToken(payload)

    // Remover password del objeto user
    const userWithoutPassword = user as any
    delete userWithoutPassword.password

    return { user: userWithoutPassword as User, token }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Buscar usuario por email
    const user = await userProvider.getUserByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verificar si está activo
    if (!user.active) {
      throw new Error('User account is disabled')
    }

    // Verificar contraseña
    const isValidPassword = verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generar token
    const userId = String(user._id)
    const payload: JwtPayload = {
      userId,
      email: user.email,
      roles: user.roles,
      admin: user.admin,
      enterpriseId: user.enterprise ? String((user.enterprise as any)._id || user.enterprise) : undefined,
    }
    const token = generateToken(payload)

    // Remover password del objeto user
    const userWithoutPassword = user.toObject()
    delete (userWithoutPassword as any).password

    return { user: userWithoutPassword as User, token }
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return userProvider.getUserById(userId)
  }
}

export const authService = new AuthService()

