import { ObjectId } from 'mongoose'
import { Service, ServiceModel } from '../models/service.model'
import { TicketPointModel } from '../models/ticket-point.model'

class ServiceProvider {
  async createService(data: Service) {
    const service = new ServiceModel(data)
    const savedService = await service.save()
    const populatedService = await ServiceModel.findById(savedService._id)
      .populate('childrenOfService')
      .populate('enterprise')
      .exec()
    
    if (!populatedService) {
      throw new Error('Failed to create service')
    }
    
    return populatedService
  }

  async getAllServices() {
    return await ServiceModel.find()
      .populate('childrenOfService')
      .populate('enterprise')
      .exec()
  }

  async getServicesByEnterprise(enterpriseId: string) {
    return await ServiceModel.find({ enterprise: enterpriseId })
      .populate('childrenOfService')
      .populate('enterprise')
      .exec()
  }

  async getServiceById(id: string | ObjectId) {
    return await ServiceModel.findById(id)
      .populate('childrenOfService')
      .populate('enterprise')
      .exec()
  }

  async getServicesByIds(ids: string[]) {
    return await ServiceModel.find({ _id: { $in: ids } })
      .populate('enterprise')
      .exec()
  }

  async getServicesByTicketPoint(ticketPointId: string) {
    // Obtener el ticket point
    const ticketPoint = await TicketPointModel.findById(ticketPointId).exec()
    if (!ticketPoint || !ticketPoint.services || ticketPoint.services.length === 0) {
      return []
    }

    // Extraer los IDs de servicios de la estructura
    const serviceIds: string[] = []
    const firstService = ticketPoint.services[0]
    
    if (typeof firstService === 'object' && 'service' in firstService) {
      // Nueva estructura con prioridad
      ticketPoint.services.forEach((s: any) => {
        const serviceId = typeof s.service === 'string' 
          ? s.service 
          : (s.service?._id?.toString() || s.service?.toString())
        if (serviceId) {
          serviceIds.push(serviceId)
        }
      })
    } else {
      // Estructura antigua (array simple)
      ticketPoint.services.forEach((s: any) => {
        const serviceId = typeof s === 'string' ? s : s._id?.toString()
        if (serviceId) {
          serviceIds.push(serviceId)
        }
      })
    }

    if (serviceIds.length === 0) {
      return []
    }

    // Obtener los servicios
    return await ServiceModel.find({ _id: { $in: serviceIds } })
      .populate('childrenOfService')
      .populate('enterprise')
      .exec()
  }

  async updateService(id: string, updateData: Partial<Service>) {
    return await ServiceModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('childrenOfService')
      .populate('enterprise')
      .exec()
  }

  async deleteService(id: string) {
    return await ServiceModel.findByIdAndDelete(id)
  }
}

export const serviceProvider = new ServiceProvider()
