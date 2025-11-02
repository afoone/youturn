import { Operator } from '../models/operator.model'
import { operatorProvider } from '../providers/operator.provider'
import { serviceQueueProvider } from '../providers/service-queue.provider'

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

  async nextCustomer(id: string): Promise<any> {
    const operator = await operatorProvider.getOperatorById(id)
    if (!operator) {
      throw new Error('Operator not found')
    }

    const queueServices = await serviceQueueProvider.getServiceQueuesByServiceIds(operator.services)

    const queues = queueServices.flatMap(queue => queue.queue)

    // get older timestamp customer
    const older = queues.reduce((older, current) => {
      if (!older) return current
      return current.timestamp < older.timestamp ? current : older
    }, null as any)

    if (!older) {
      throw new Error('No customers in queue')
    }

    // Remove customer from queue
    // for (const serviceId of operator.services) {
    //   const serviceQueue: ServiceQueue | null = await serviceQueueProvider.getServiceQueueByServiceIdOrCreate(serviceId)
    //   if (serviceQueue) {
    //     const updatedQueue = serviceQueue.queue.filter(qElement => String(qElement._id) !== older._id.toString())
    //     await serviceQueueProvider.updateServiceQueue(String(serviceQueue._id), { queue: updatedQueue })
    //   }
    // }

 

    return older
  }
}

export const operatorService = new OperatorService()
