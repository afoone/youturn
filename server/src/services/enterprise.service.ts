import { Enterprise } from '../models/enterprise.model'
import { enterpriseProvider } from '../providers/enterprise.provider'

class EnterpriseService {
  async getEnterprises(): Promise<Enterprise[]> {
    return enterpriseProvider.getEnterprises()
  }

  async getEnterpriseById(id: string): Promise<Enterprise | null> {
    return enterpriseProvider.getEnterpriseById(id)
  }

  async createEnterprise(data: Partial<Enterprise>): Promise<Enterprise> {
    if (!data.name || !data.email || !data.phone) {
      throw new Error('Missing required fields')
    }
    return enterpriseProvider.createEnterprise(data)
  }

  async updateEnterprise(id: string, data: Partial<Enterprise>): Promise<Enterprise | null> {
    return enterpriseProvider.updateEnterprise(id, data)
  }

  async deleteEnterprise(id: string): Promise<Enterprise | null> {
    return enterpriseProvider.deleteEnterprise(id)
  }
}

export const enterpriseService = new EnterpriseService()
