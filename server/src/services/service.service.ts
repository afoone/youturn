import { Service } from '../models/service.model'
import { serviceProvider } from '../providers/service.provider'
import { AuthRequest } from '../middleware/auth.middleware'

export class ServiceService {
  // Obtener todos los servicios
  async getAllServices(requestingUser?: AuthRequest['user'], ticketPointId?: string): Promise<Service[]> {
    // Si se proporciona ticketPointId, filtrar por ticket point
    if (ticketPointId) {
      return serviceProvider.getServicesByTicketPoint(ticketPointId)
    }
    
    // Si es ENTERPRISE_ADMIN, solo devolver los de su empresa
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      return serviceProvider.getServicesByEnterprise(requestingUser.enterpriseId)
    }
    // Si es admin, devolver todos
    return serviceProvider.getAllServices()
  }

  // Obtener un servicio por UUID
  async getServiceById(uuid: string): Promise<Service | null> {
    return serviceProvider.getServiceById(uuid)
  }

  // Crear un nuevo servicio
  async createService(
    serviceData: Service,
    requestingUser?: AuthRequest['user']
  ): Promise<Service> {
    if (!serviceData.name) {
      throw new Error('Missing required field: name')
    }
    if (!serviceData.prefix) {
      throw new Error('Missing required field: prefix')
    }
    
    // Si es ENTERPRISE_ADMIN, forzar la empresa a la suya
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      serviceData.enterprise = requestingUser.enterpriseId as any
    }
    
    if (!serviceData.enterprise) {
      throw new Error('Missing required field: enterprise')
    }
    return serviceProvider.createService(serviceData)
  }

  // Actualizar un servicio
  async updateService(
    uuid: string,
    serviceData: Partial<Service>,
    requestingUser?: AuthRequest['user']
  ): Promise<Service | null> {
    // Si es ENTERPRISE_ADMIN, asegurar que solo puede actualizar servicios de su empresa
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      // Verificar que el servicio pertenece a su empresa
      const existingService = await serviceProvider.getServiceById(uuid)
      if (!existingService) {
        return null
      }

      const existingEnterpriseId = existingService.enterprise?.toString()
      if (existingEnterpriseId !== requestingUser.enterpriseId) {
        throw new Error('You can only update services from your own enterprise')
      }

      // Forzar la empresa a la suya (no puede cambiarla)
      serviceData.enterprise = requestingUser.enterpriseId as any
    }

    // Si se está actualizando el enterprise, validar que exista
    if (serviceData.enterprise !== undefined && !serviceData.enterprise) {
      throw new Error('Enterprise is required')
    }
    return serviceProvider.updateService(uuid, serviceData)
  }

  // Eliminar un servicio
  async deleteService(uuid: string): Promise<boolean> {
    return !!(await serviceProvider.deleteService(uuid))
  }
}

export const serviceService = new ServiceService()
