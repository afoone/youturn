import { Types } from 'mongoose'
import { User } from '../models/user.model'
import { userProvider } from '../providers/user.provider'
import { hashPassword } from '../utils/crypto.util'
import { VALID_ROLES, Role } from '../constants/roles.constants'
import { serviceProvider } from '../providers/service.provider'

class UserService {
  async getUsers(): Promise<User[]> {
    return userProvider.getUsers()
  }

  async getUserById(id: string): Promise<User | null> {
    return userProvider.getUserById(id)
  }

  async createUser(data: Partial<User>, requestingUser?: { userId: string; email: string; roles: string[]; admin: boolean; enterpriseId?: string }): Promise<User> {
    // Validar que ENTERPRISE_ADMIN no puede crear usuarios admin
    if (requestingUser && !requestingUser.admin && requestingUser.roles?.includes('ENTERPRISE_ADMIN')) {
      if (data.admin) {
        throw new Error('ENTERPRISE_ADMIN users cannot create admin users')
      }
      
      // Validar que solo puede crear usuarios de su misma enterprise
      if (!requestingUser.enterpriseId) {
        throw new Error('ENTERPRISE_ADMIN user must have an enterprise')
      }
      
      if (data.enterprise && data.enterprise.toString() !== requestingUser.enterpriseId) {
        throw new Error('ENTERPRISE_ADMIN users can only create users for their own enterprise')
      }
      
      // Asignar automáticamente la enterprise del usuario que crea
      data.enterprise = new Types.ObjectId(requestingUser.enterpriseId)
    }

    // Validar roles
    if (data.roles && data.roles.length > 0) {
      const invalidRoles = data.roles.filter(role => !VALID_ROLES.includes(role as Role))
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${VALID_ROLES.join(', ')}`)
      }
    }

    // Validar: si no es admin, debe tener enterprise
    if (!data.admin && !data.enterprise) {
      throw new Error('Enterprise is required for non-admin users')
    }

    // Validar roles específicos
    const isOperator = data.roles && data.roles.includes('OPERATOR')
    const isEnterpriseAdmin = data.roles && data.roles.includes('ENTERPRISE_ADMIN')

    if (isOperator && !data.enterprise) {
      throw new Error('Enterprise is required for OPERATOR users')
    }

    if (isEnterpriseAdmin && !data.enterprise) {
      throw new Error('Enterprise is required for ENTERPRISE_ADMIN users')
    }

    // Validar servicios para OPERATOR: solo servicios de su misma enterprise
    if (isOperator && data.services && data.services.length > 0) {
      await this.validateServicesForEnterprise(data.services as Types.ObjectId[], data.enterprise as Types.ObjectId)
    }

    // ENTERPRISE_ADMIN no debe tener servicios
    if (isEnterpriseAdmin && data.services && data.services.length > 0) {
      throw new Error('ENTERPRISE_ADMIN users cannot have associated services')
    }

    // Hash de la contraseña si se proporciona
    if (data.password) {
      data.password = hashPassword(data.password)
    }

    // Si es admin, no debe tener enterprise ni servicios
    if (data.admin) {
      data.enterprise = undefined
      data.services = undefined
    }

    const user = await userProvider.createUser(data)
    const userWithoutPassword = user.toObject()
    delete (userWithoutPassword as any).password
    return userWithoutPassword as User
  }

  private async validateServicesForEnterprise(serviceIds: Types.ObjectId[], enterpriseId: Types.ObjectId): Promise<void> {
    const services = await serviceProvider.getServicesByIds(serviceIds.map(id => id.toString()))
    
    for (const service of services) {
      const serviceEnterpriseId = service.enterprise ? (service.enterprise as any)._id || service.enterprise : null
      if (!serviceEnterpriseId || serviceEnterpriseId.toString() !== enterpriseId.toString()) {
        throw new Error(`Service ${service.name} does not belong to the user's enterprise`)
      }
    }
  }

  async updateUser(id: string, data: Partial<User>, requestingUser?: { userId: string; email: string; roles: string[]; admin: boolean; enterpriseId?: string }): Promise<User | null> {
    // Obtener usuario actual para validar
    const currentUser = await userProvider.getUserById(id)
    if (!currentUser) {
      throw new Error('User not found')
    }

    // Validar que ENTERPRISE_ADMIN no puede hacer usuarios admin
    if (requestingUser && !requestingUser.admin && requestingUser.roles?.includes('ENTERPRISE_ADMIN')) {
      if (data.admin !== undefined && data.admin) {
        throw new Error('ENTERPRISE_ADMIN users cannot make users admin')
      }
      
      // Validar que solo puede editar usuarios de su misma enterprise
      if (!requestingUser.enterpriseId) {
        throw new Error('ENTERPRISE_ADMIN user must have an enterprise')
      }
      
      const currentUserEnterpriseId = currentUser.enterprise 
        ? (currentUser.enterprise as any)._id?.toString() || currentUser.enterprise.toString()
        : null
      
      if (currentUserEnterpriseId !== requestingUser.enterpriseId) {
        throw new Error('ENTERPRISE_ADMIN users can only edit users from their own enterprise')
      }
      
      // Asegurar que no se cambie la enterprise
      if (data.enterprise && data.enterprise.toString() !== requestingUser.enterpriseId) {
        throw new Error('ENTERPRISE_ADMIN users cannot change user enterprise')
      }
      
      // Asignar automáticamente la enterprise del usuario que edita
      data.enterprise = new Types.ObjectId(requestingUser.enterpriseId)
    }

    // Validar roles
    if (data.roles && data.roles.length > 0) {
      const invalidRoles = data.roles.filter(role => !VALID_ROLES.includes(role as Role))
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${VALID_ROLES.join(', ')}`)
      }
    }

    // Determinar valores finales después de la actualización
    const willBeAdmin = data.admin !== undefined ? data.admin : currentUser.admin
    const finalRoles = data.roles || currentUser.roles || []
    const finalEnterprise = data.enterprise || currentUser.enterprise
    const finalServices = data.services !== undefined ? data.services : currentUser.services

    const isOperator = finalRoles.includes('OPERATOR')
    const isEnterpriseAdmin = finalRoles.includes('ENTERPRISE_ADMIN')

    // Validar: si no es admin, debe tener enterprise
    if (!willBeAdmin && !finalEnterprise) {
      throw new Error('Enterprise is required for non-admin users')
    }

    // Validar roles específicos
    if (isOperator && !finalEnterprise) {
      throw new Error('Enterprise is required for OPERATOR users')
    }

    if (isEnterpriseAdmin && !finalEnterprise) {
      throw new Error('Enterprise is required for ENTERPRISE_ADMIN users')
    }

    // Validar servicios para OPERATOR: solo servicios de su misma enterprise
    if (isOperator && finalServices && finalServices.length > 0) {
      await this.validateServicesForEnterprise(
        finalServices as Types.ObjectId[],
        finalEnterprise as Types.ObjectId
      )
    }

    // ENTERPRISE_ADMIN no debe tener servicios
    if (isEnterpriseAdmin && finalServices && finalServices.length > 0) {
      throw new Error('ENTERPRISE_ADMIN users cannot have associated services')
    }

    // Si se convierte en admin, remover enterprise y servicios
    if (willBeAdmin) {
      data.enterprise = undefined
      data.services = undefined
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

