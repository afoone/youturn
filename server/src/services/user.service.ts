import { User } from '../models/user.model'
import { userProvider } from '../providers/user.provider'
import { hashPassword } from '../utils/crypto.util'

class UserService {
  async getUsers(): Promise<User[]> {
    return userProvider.getUsers()
  }

  async getUserById(id: string): Promise<User | null> {
    return userProvider.getUserById(id)
  }

  async createUser(data: Partial<User>): Promise<User> {
    // Validar: si no es admin, debe tener enterprise
    if (!data.admin && !data.enterprise) {
      throw new Error('Enterprise is required for non-admin users')
    }

    // Hash de la contraseña si se proporciona
    if (data.password) {
      data.password = hashPassword(data.password)
    }

    // Roles por defecto si no se proporcionan
    if (!data.roles || data.roles.length === 0) {
      data.roles = ['user']
    }

    // Si es admin, no debe tener enterprise
    if (data.admin) {
      data.enterprise = undefined
    }

    const user = await userProvider.createUser(data)
    const userWithoutPassword = user.toObject()
    delete (userWithoutPassword as any).password
    return userWithoutPassword as User
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    // Obtener usuario actual para validar
    const currentUser = await userProvider.getUserById(id)
    if (!currentUser) {
      throw new Error('User not found')
    }

    // Determinar si será admin después de la actualización
    const willBeAdmin = data.admin !== undefined ? data.admin : currentUser.admin

    // Validar: si no es admin, debe tener enterprise
    if (!willBeAdmin && !data.enterprise && !currentUser.enterprise) {
      throw new Error('Enterprise is required for non-admin users')
    }

    // Si se convierte en admin, remover enterprise
    if (willBeAdmin) {
      data.enterprise = undefined
    }

    // Hash de la contraseña si se proporciona
    if (data.password) {
      data.password = hashPassword(data.password)
    }

    return userProvider.updateUser(id, data)
  }

  async deleteUser(id: string): Promise<User | null> {
    return userProvider.deleteUser(id)
  }
}

export const userService = new UserService()

