import { Request, Response } from 'express'
import { customerService } from '../services/customer.service'
import { queueService } from '../services/queue.service'

class QueueController {

  enqueueCustomer = async (req: Request, res: Response) => {
    const { serviceId } = req.params
    try {
      const customer = await queueService.addNewCustomerToQueue(serviceId)
      res.status(200).json(customer)
    } catch (error) {
      res.status(500).json({ message: 'Error enqueuing customer', error })
    }
  }
  
}

export const queueController = new QueueController()
