import { ObjectId, Types } from 'mongoose'
import { Customer, CustomerDocument, CustomerModel } from '../models/customer.model'
import { ServiceQueue, ServiceQueueDocument, ServiceQueueModel } from '../models/service-queue.model'
import { Service } from '../models/service.model'
import { serviceProvider } from './service.provider'



class ServiceQueueProvider {
  async getServiceQueues(): Promise<ServiceQueueDocument[]> {
    return ServiceQueueModel.find()
  }

  async getServiceQueueById(id: string): Promise<ServiceQueueDocument | null> {
    return ServiceQueueModel.findById(id)
  }

  async getServiceQueuesByServiceIds(serviceIds: string[]): Promise<ServiceQueueDocument[]> {
    return ServiceQueueModel.find({ service: { $in: serviceIds } })
  }

  async getServiceQueueByServiceIdOrCreate(serviceId: string): Promise<ServiceQueueDocument | null> {
    let serviceQueue = await ServiceQueueModel.findOne({ service: serviceId })

    if (!serviceQueue) {
      const service = await serviceProvider.getServiceById(serviceId)
      if (!service) {
        throw new Error('Service not found')
      }
      const newServiceQueue = await this.createServiceQueue(service)
      return newServiceQueue
    } else {
      return serviceQueue
    }
  }

  async createServiceQueue(data: Service): Promise<ServiceQueueDocument> {
    return ServiceQueueModel.create({
      service: data._id,
      queue: [],
    })
  }

  async updateServiceQueue(id: string, data: Partial<ServiceQueue>): Promise<ServiceQueueDocument | null> {
    return ServiceQueueModel.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteServiceQueue(id: string): Promise<ServiceQueue | null> {
    return ServiceQueueModel.findByIdAndDelete(id)
  }

  async addCustomerToQueue(serviceId: string, customerData: Partial<CustomerDocument>): Promise<CustomerDocument> {
    // 1️⃣ Obtener prefijo del servicio
    const service = await serviceProvider.getServiceById(serviceId)
    if (!service) throw new Error('Service not found')
    const prefix = service.prefix || ''

    // 2️⃣ Crear el Customer primero
    const newCustomer = await CustomerModel.create({
      ...customerData,
      serviceId,
      service: service._id,
      status: 'QUEUED',
    })

    // 3️⃣ Actualizar la cola atomically
    const updatedQueue = await ServiceQueueModel.findOneAndUpdate(
      { service: service._id },
      {
        $inc: { count: 1 },
        $push: {
          queue: {
            _id: new Types.ObjectId(),
            customer: newCustomer._id,
            timestamp: Date.now(),
            status: 'QUEUED',
          },
        },
      },
      { new: true, upsert: true }
    )

    // 4️⃣ Generar ticketNumber basado en el contador actualizado
    const count = updatedQueue?.count || 1
    const ticketNumber = `${prefix}${(count > 999 ? 1 : count).toString().padStart(3, '0')}`

    // 5️⃣ Actualizar ticketNumber en Customer
    newCustomer.ticketNumber = ticketNumber
    await newCustomer.save()

    return newCustomer
  }

  async getCustomersByServiceIdsAndState(serviceIds: (string | Types.ObjectId)[], state: string): Promise<Customer[]> {
    const objectIds = serviceIds.map(id => (typeof id === 'string' ? new Types.ObjectId(id) : id))

    const results = await ServiceQueueModel.aggregate([
      { $match: { service: { $in: objectIds } } },
      { $unwind: '$queue' },
      {
        $lookup: {
          from: 'customers',
          localField: 'queue.customer',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
            { $match: { 'customer.status': state } },
      {
        $lookup: {
          from: 'operators',
          localField: 'customer.operator',
          foreignField: '_id',
          as: 'operator', // ojo, lo dejamos en otro campo
        },
      },
      { $unwind: { path: '$operator', preserveNullAndEmptyArrays: true } },
      {
        $addFields: { 'customer.operator': '$operator' }, // movemos operator al customer
      },
      { $replaceRoot: { newRoot: '$customer' } },
    ])

    return results as Customer[]
  }
}

export const serviceQueueProvider = new ServiceQueueProvider()
