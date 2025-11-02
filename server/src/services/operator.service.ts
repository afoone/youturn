import { CustomerDocument, CustomerModel } from '../models/customer.model'
import { Operator } from '../models/operator.model'
import { ServiceQueue, ServiceQueueDocument, ServiceQueueModel } from '../models/service-queue.model'
import { operatorProvider } from '../providers/operator.provider'
import { serviceQueueProvider } from '../providers/service-queue.provider'
import { serviceProvider } from '../providers/service.provider'

class OperatorService {
  async getOperators(): Promise<Operator[]> {
    return operatorProvider.getOperators()
  }

  async getOperatorById(id: string): Promise<Operator | null> {
    return operatorProvider.getOperatorById(id)
  }

  async createOperator(data: Partial<Operator>): Promise<Operator> {
    return operatorProvider.createOperator(data)
  }

  async updateOperator(id: string, data: Partial<Operator>): Promise<Operator | null> {
    return operatorProvider.updateOperator(id, data)
  }

  async deleteOperator(id: string): Promise<Operator | null> {
    return operatorProvider.deleteOperator(id)
  }

  async nextCustomer(operatorId: string): Promise<CustomerDocument | null> {
    // 1️⃣ Obtener operador
    const operator = await operatorProvider.getOperatorById(operatorId)
    if (!operator) throw new Error('Operator not found')

    // 2️⃣ Obtener todas las colas de los servicios del operador
    const queueServices: ServiceQueue[] = await serviceQueueProvider.getServiceQueuesByServiceIds(operator.services)

    let oldestCustomer: CustomerDocument | null = null
    let oldestTimestamp = Infinity

    for (const queueService of queueServices) {
      for (const queueElement of queueService.queue) {
        // Traer el customer completo para poder mirar operator
        const customer = await CustomerModel.findById(queueElement.customer)

        if (!customer) continue
        // Ignorar si ya está asignado a otro operador
        if (customer.operator && customer.operator.toString() !== operatorId) continue

        if (queueElement.timestamp < oldestTimestamp) {
          oldestTimestamp = queueElement.timestamp
          oldestCustomer = customer
        }
      }
    }

    if (!oldestCustomer) throw new Error('No customers available for this operator')

    // 3️⃣ Actualizar el customer asignándole operador y estado
    oldestCustomer.status = 'CALLING'
    oldestCustomer.operator = operator
    await oldestCustomer.save()

    return oldestCustomer
  }

  async getInServiceCustomer(operatorId: string): Promise<CustomerDocument | null> {
    // Buscar el cliente que está en servicio para el operador dado
    const customer = await CustomerModel.findOne({
      operator: operatorId,
      status: 'IN_SERVICE',
    })
    return customer
  }

  async waitingRoom(operatorId: string): Promise<{ label: string; count: number }[]> {
    // 1️⃣ Obtener operador
    const operator = await operatorProvider.getOperatorById(operatorId)
    if (!operator) throw new Error('Operator not found')

    // 2️⃣ Obtener todas las colas de los servicios del operador
    const queueServices: ServiceQueue[] = await serviceQueueProvider.getServiceQueuesByServiceIds(operator.services)

    const services = await serviceProvider.getServicesByIds(operator.services)

    const waitingQueue = queueServices.map(qs => {
      const service = services.find(s => String(s._id) === String(qs.service))
      return {
        label: service ? service.name : 'Unknown Service',
        count: qs.count,
      }
    })

    return waitingQueue
  }

  async attendCustomer(customerId: string): Promise<CustomerDocument | null> {
    const customer = await CustomerModel.findById(customerId)
    if (!customer) throw new Error('Customer not found')

    customer.status = 'IN_SERVICE'

    // Remove customer from any queue it might be in
    await ServiceQueueModel.updateMany(
      { 'queue.customer': customer._id },
      {
        $pull: {
          queue: { customer: customer._id },
        },
        $inc: { count: -1 },
      }
    )
    await customer.save()

    return customer
  }

  async completeService(customerId: string): Promise<CustomerDocument | null> {
    const customer = await CustomerModel.findById(customerId)
    if (!customer) throw new Error('Customer not found')

    customer.status = 'COMPLETED'
    await customer.save()

    return customer
  }
}

export const operatorService = new OperatorService()
