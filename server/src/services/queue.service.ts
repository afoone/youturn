import { Customer } from '../models/customer.model'
import { Status } from '../models/operator.model'
import { ServiceQueue, ServiceQueueModel } from '../models/service-queue.model'
import { serviceQueueProvider } from '../providers/service-queue.provider'
import { serviceProvider } from '../providers/service.provider'
import { ticketPointProvider } from '../providers/ticket-point.provider'

export class QueueService {
  // Añadir un cliente a la cola de un servicio
  // async addCustomerToQueue(serviceId: string, customer: Customer): Promise<ServiceQueue | null> {
  //   try {
  //     // Obtener el servicio por ID
  //     const service = await serviceProvider.getServiceById(serviceId)
  //     if (!service) {
  //       throw new Error('Service not found')
  //     }

  //     // Guardar el customer en la base de datos y recuperar su ID
  //     const newCustomer = await customerProvider.createCustomer(customer)

  //     // Crear el nuevo QueueElement
  //     const queueElement = {
  //       customer: newCustomer._id,
  //       timestamp: Date.now(),
  //       status: '',
  //     }

  //     // Buscar el ServiceQueue para el servicio y si no existe, crear uno nuevo
  //     let serviceQueue = await ServiceQueueModel.findOne({ service: serviceId })
  //       if (!serviceQueue) {
  //           // Si no existe un ServiceQueue, crear uno nuevo
  //           serviceQueue =serviceQueueProvider.createServiceQueue()
  //       } else {
  //           // Si ya existe el ServiceQueue, añadir el nuevo QueueElement
  //           serviceQueue.queue.push(queueElement)
  //       }

  //     if (!serviceQueue) {
  //       // Si no existe un ServiceQueue, crear uno nuevo
  //       serviceQueue = new ServiceQueueModel({
  //         service: service._id,
  //         queue: [queueElement],
  //       })
  //     } else {
  //       // Si ya existe el ServiceQueue, añadir el nuevo QueueElement
  //       serviceQueue.queue.push(queueElement)
  //     }

  //     // Guardar el ServiceQueue
  //     await serviceQueue.save()

  //     return serviceQueue
  //   } catch (error) {
  //     console.error('Error adding customer to queue:', error)
  //     throw error
  //   }
  // }

  async addNewCustomerToQueue(serviceId: string, ticketPointId?: string): Promise<Customer | null> {
    try {
      // Obtener el servicio por ID
      const service = await serviceProvider.getServiceById(serviceId)
      if (!service) {
        throw new Error('Service not found')
      }

      // Determinar prioridad basada en ticketPointId si se proporciona
      let priority = false
      if (ticketPointId) {
        const ticketPoint = await ticketPointProvider.getTicketPointById(ticketPointId)
        if (ticketPoint && ticketPoint.services && ticketPoint.services.length > 0) {
          // Verificar si es la nueva estructura (con prioridad) o la antigua
          const firstService = ticketPoint.services[0]
          if (typeof firstService === 'object' && 'service' in firstService && 'priority' in firstService) {
            // Nueva estructura con prioridad
            const servicePriority = ticketPoint.services.find((s: any) => {
              let serviceIdStr: string
              if (typeof s.service === 'object' && s.service?._id) {
                serviceIdStr = s.service._id.toString()
              } else if (typeof s.service === 'string') {
                serviceIdStr = s.service
              } else {
                serviceIdStr = s.service?.toString() || ''
              }
              return serviceIdStr === serviceId
            })
            priority = servicePriority?.priority === true
          }
          // Si es estructura antigua, priority permanece false
        }
      }

      // Crear un nuevo cliente con el estado inicial
      const newCustomer: Customer = {
        queuedTime: Date.now(),
        status: 'QUEUED',
        serviceId,
        service,
        priority,
      }

      const serviceQueue = await serviceQueueProvider.getServiceQueueByServiceIdOrCreate(serviceId)
      if (!serviceQueue) {
        throw new Error('ServiceQueue not found or could not be created')
      }

      // Añadir el cliente a la cola del servicio
      const updatedCustomer = await serviceQueueProvider.addCustomerToQueue(serviceId, newCustomer)
      if (!updatedCustomer) {
        throw new Error('Failed to add customer to service queue')
      }
      console.log('Updated Service Queue:', updatedCustomer)
  

      return updatedCustomer

      //   // Añadir el cliente a la cola del servicio
      //   const updatedQueue = await this.addCustomerToQueue(serviceId, newCustomer)
      //   return updatedQueue
    } catch (error) {
      console.error('Error adding new customer to queue:', error)
      throw error
    }
    return null
  }
}

export const queueService = new QueueService()
