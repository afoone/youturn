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
    // Hash de la contraseña si se proporciona
    if (data.password) {
      data.password = hashPassword(data.password)
    }

    // Roles por defecto si no se proporcionan
    if (!data.roles || data.roles.length === 0) {
      data.roles = ['user']
    }

    const user = await userProvider.createUser(data)
    const userWithoutPassword = user.toObject()
    delete (userWithoutPassword as any).password
    return userWithoutPassword as User
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
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

