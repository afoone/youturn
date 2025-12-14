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

    let oldestPriorityCustomer: CustomerDocument | null = null
    let oldestPriorityTimestamp = Infinity
    let oldestNormalCustomer: CustomerDocument | null = null
    let oldestNormalTimestamp = Infinity

    // 3️⃣ Buscar clientes, separando prioritarios de normales
    for (const queueService of queueServices) {
      for (const queueElement of queueService.queue) {
        // Traer el customer completo para poder mirar operator y priority
        const customer = await CustomerModel.findById(queueElement.customer)

        if (!customer) continue
        // Ignorar si ya está asignado a otro operador
        if (customer.operator && customer.operator.toString() !== operatorId) continue

        const isPriority = customer.priority === true
        const timestamp = queueElement.timestamp

        if (isPriority) {
          // Cliente prioritario
          if (timestamp < oldestPriorityTimestamp) {
            oldestPriorityTimestamp = timestamp
            oldestPriorityCustomer = customer
          }
        } else {
          // Cliente normal
          if (timestamp < oldestNormalTimestamp) {
            oldestNormalTimestamp = timestamp
            oldestNormalCustomer = customer
          }
        }
      }
    }

    // 4️⃣ Priorizar clientes con priority=true, si no hay, usar clientes normales
    const selectedCustomer = oldestPriorityCustomer || oldestNormalCustomer

    if (!selectedCustomer) throw new Error('No customers available for this operator')

    // 5️⃣ Actualizar el customer asignándole operador y estado
    selectedCustomer.status = 'CALLING'
    selectedCustomer.operator = operator
    await selectedCustomer.save()

    return selectedCustomer
  }

  async getInServiceCustomer(operatorId: string): Promise<CustomerDocument | null> {
    // Buscar el cliente que está en servicio o siendo llamado para el operador dado
    // Priorizar IN_SERVICE sobre CALLING
    let customer = await CustomerModel.findOne({
      operator: operatorId,
      status: 'IN_SERVICE',
    })
    
    // Si no hay cliente en servicio, buscar uno que esté siendo llamado
    if (!customer) {
      customer = await CustomerModel.findOne({
        operator: operatorId,
        status: 'CALLING',
      })
    }
    
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
        count: qs.queue?.length,
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

  async recallCustomer(customerId: string): Promise<CustomerDocument | null> {
    const customer = await CustomerModel.findById(customerId)
    if (!customer) throw new Error('Customer not found')

    // Cambiar el estado a CALLING para que vuelva a aparecer en la pantalla
    customer.status = 'CALLING'
    
    // Incrementar el contador de rellamadas si existe
    if (customer.recallCount) {
      customer.recallCount += 1
    } else {
      customer.recallCount = 1
    }
    
    await customer.save()

    return customer
  }

  async changeCustomerService(customerId: string, newServiceId: string): Promise<CustomerDocument | null> {
    const customer = await CustomerModel.findById(customerId)
    if (!customer) throw new Error('Customer not found')

    // Verificar que el cliente esté en servicio
    if (customer.status !== 'IN_SERVICE') {
      throw new Error('Customer must be in service to change service')
    }

    // Usar el provider para cambiar el servicio (esto remueve de la cola anterior y añade a la nueva con prioridad)
    const updatedCustomer = await serviceQueueProvider.addExistingCustomerToQueue(newServiceId, customerId, true)
    
    return updatedCustomer
  }
}

export const operatorService = new OperatorService()
