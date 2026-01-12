import { Enterprise, EnterpriseModel } from '../models/enterprise.model'

class EnterpriseProvider {
  async getEnterprises(): Promise<Enterprise[]> {
    return EnterpriseModel.find().populate('plan').exec()
  }

  async getEnterpriseById(id: string): Promise<Enterprise | null> {
    return EnterpriseModel.findById(id).populate('plan').exec()
  }

  async createEnterprise(data: Partial<Enterprise>): Promise<Enterprise> {
    const enterprise = await EnterpriseModel.create(data)
    return enterprise.populate('plan')
  }

  async updateEnterprise(id: string, data: Partial<Enterprise>): Promise<Enterprise | null> {
    const updated = await EnterpriseModel.findByIdAndUpdate(id, data, { new: true })
      .populate('plan')
      .exec()
    return updated
  }

  async deleteEnterprise(id: string): Promise<Enterprise | null> {
    return EnterpriseModel.findByIdAndDelete(id)
  }
}

export const enterpriseProvider = new EnterpriseProvider()
