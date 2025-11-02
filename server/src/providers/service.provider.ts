import { ObjectId } from 'mongoose'
import { Service, ServiceModel } from '../models/service.model'

class ServiceProvider {
  async createService(data: Service) {
    const service = new ServiceModel(data)
    return await service.save()
  }

  async getAllServices() {
    return await ServiceModel.find().populate('childrenOfService').exec()
  }

  async getServiceById(id: string | ObjectId) {
    return await ServiceModel.findById(id).populate('childrenOfService').exec()
  }

  async getServicesByIds(ids: string[]) {
    return await ServiceModel.find({ _id: { $in: ids } }).exec()
  }

  async updateService(id: string, updateData: Partial<Service>) {
    return await ServiceModel.findByIdAndUpdate(id, updateData, { new: true })
  }

  async deleteService(id: string) {
    return await ServiceModel.findByIdAndDelete(id)
  }
}

export const serviceProvider = new ServiceProvider()
