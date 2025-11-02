import { ObjectId, Types } from 'mongoose'
import { Customer } from '../models/customer.model'
import { ScreenDocument } from '../models/screen.model'
import { screenProvider } from '../providers/screen.provider'
import { serviceQueueProvider } from '../providers/service-queue.provider'

class ScreenService {
  async getScreens(): Promise<ScreenDocument[]> {
    return screenProvider.getScreens()
  }

  async getScreenById(id: string): Promise<ScreenDocument | null> {
    return screenProvider.getScreenById(id)
  }

  async createScreen(data: Partial<Screen>): Promise<ScreenDocument> {
    return screenProvider.createScreen(data)
  }

  async updateScreen(id: string, data: Partial<Screen>): Promise<ScreenDocument | null> {
    return screenProvider.updateScreen(id, data)
  }

  async deleteScreen(id: string): Promise<ScreenDocument | null> {
    return screenProvider.deleteScreen(id)
  }

  async getScreenCustomers(id: string): Promise<Customer[]> {
    // get services assigned to screen
    const screen = await screenProvider.getScreenById(id)

    const serviceIds: (string | Types.ObjectId)[] = (screen?.services || []).map(s => s._id as Types.ObjectId)

    if (serviceIds.length === 0) {
      return []
    }

    // get customers on CALLED STATE from service queues
    const callingCustomers = await serviceQueueProvider.getCustomersByServiceIdsAndState(serviceIds, 'CALLING')
    return callingCustomers
  }
}

export const screenService = new ScreenService()
