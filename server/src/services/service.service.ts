import { Service } from '../models/service.model'
import { serviceProvider } from '../providers/service.provider'

export class ServiceService {
  // Obtener todos los servicios
  async getAllServices(): Promise<Service[]> {
    return serviceProvider.getAllServices()
  }

  // Obtener un servicio por UUID
  async getServiceById(uuid: string): Promise<Service | null> {
    return serviceProvider.getServiceById(uuid)
  }

  // Crear un nuevo servicio
  async createService(serviceData: Service): Promise<Service> {
    if (!serviceData.name || !serviceData.description) {
      throw new Error('Missing required fields: name or description')
    }
    return serviceProvider.createService(serviceData)
  }

  // Actualizar un servicio
  async updateService(uuid: string, serviceData: Partial<Service>): Promise<Service | null> {
    return serviceProvider.updateService(uuid, serviceData)
  }

  // Eliminar un servicio
  async deleteService(uuid: string): Promise<boolean> {
    return !!(await serviceProvider.deleteService(uuid))
  }
}

export const serviceService = new ServiceService()
