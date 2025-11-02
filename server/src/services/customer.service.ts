import { Customer } from '../models/customer.model'
import { customerProvider } from '../providers/customer.provider'

class CustomerService {
  async getCustomers(): Promise<Customer[]> {
    return customerProvider.getCustomers()
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return customerProvider.getCustomerById(id)
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return customerProvider.createCustomer(data)
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    return customerProvider.updateCustomer(id, data)
  }

  async deleteCustomer(id: string): Promise<Customer | null> {
    return customerProvider.deleteCustomer(id)
  }
}

export const customerService = new CustomerService()
