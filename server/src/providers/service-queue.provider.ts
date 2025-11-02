import { Customer } from '../models/customer.model'
import { ServiceQueue, ServiceQueueModel } from '../models/service-queue.model'
import { Service } from '../models/service.model'
import { serviceProvider } from './service.provider'

class ServiceQueueProvider {
  async getServiceQueues(): Promise<ServiceQueue[]> {
    return ServiceQueueModel.find()
  }

  async getServiceQueueById(id: string): Promise<ServiceQueue | null> {
    return ServiceQueueModel.findById(id)
  }

  async getServiceQueuesByServiceIds(serviceIds: string[]): Promise<ServiceQueue[]> {
    return ServiceQueueModel.find({ service: { $in: serviceIds } })
  }

  async getServiceQueueByServiceIdOrCreate(serviceId: string): Promise<ServiceQueue | null> {
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

  async createServiceQueue(data: Service): Promise<ServiceQueue> {
    return ServiceQueueModel.create({
      service: data._id,
      queue: [],
    })
  }

  async updateServiceQueue(id: string, data: Partial<ServiceQueue>): Promise<ServiceQueue | null> {
    return ServiceQueueModel.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteServiceQueue(id: string): Promise<ServiceQueue | null> {
    return ServiceQueueModel.findByIdAndDelete(id)
  }
  async addCustomerToQueue(serviceId: string, customer: Customer): Promise<Customer | null> {
    // Obtén el prefijo del servicio antes de actualizar
    const service = await serviceProvider.getServiceById(serviceId)
    const prefix = service?.prefix || ''

    // Actualiza la cola y el contador
    const serviceQueue = await ServiceQueueModel.findOneAndUpdate(
      { service: serviceId },
      [
        {
          $set: {
            count: {
              $let: {
                vars: { newCount: { $add: ['$count', 1] } },
                in: { $cond: [{ $gte: ['$$newCount', 1000] }, 1, '$$newCount'] },
              },
            },
            queue: {
              $concatArrays: [
                '$queue',
                [
                  {
                    customer: {
                      ...customer, // convierte a plain object para poder setear ticketNumber
                      ticketNumber: {
                        $concat: [
                          prefix,
                          {
                            $toString: {
                              $cond: [{ $gte: [{ $add: ['$count', 1] }, 1000] }, 1, { $add: ['$count', 1] }],
                            },
                          },
                        ],
                      },
                    },
                    timestamp: Date.now(),
                    status: 'QUEUED',
                  },
                ],
              ],
            },
          },
        },
      ],
      { new: true }
    )

    // Obtén el customer agregado del último elemento de la cola
    const lastCustomerInQueue = serviceQueue?.queue[serviceQueue.queue.length - 1]?.customer

    return lastCustomerInQueue || null
  }
}

export const serviceQueueProvider = new ServiceQueueProvider()
