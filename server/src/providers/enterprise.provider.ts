import { Enterprise, EnterpriseModel } from '../models/enterprise.model'

class EnterpriseProvider {
  async getEnterprises(): Promise<Enterprise[]> {
    return EnterpriseModel.find()
  }

  async getEnterpriseById(id: string): Promise<Enterprise | null> {
    return EnterpriseModel.findById(id)
  }

  async createEnterprise(data: Partial<Enterprise>): Promise<Enterprise> {
    return EnterpriseModel.create(data)
  }

  async updateEnterprise(id: string, data: Partial<Enterprise>): Promise<Enterprise | null> {
    return EnterpriseModel.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteEnterprise(id: string): Promise<Enterprise | null> {
    return EnterpriseModel.findByIdAndDelete(id)
  }
}

export const enterpriseProvider = new EnterpriseProvider()
