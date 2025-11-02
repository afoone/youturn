import { Request, Response } from 'express'
import { customerService } from '../services/customer.service'

class CustomerController {
  async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.getCustomers()
      res.json(customers)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving customer'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const customer = await customerService.getCustomerById(id)
      if (!customer) {
        res.status(404).json({ message: 'customer not found' })
        return
      }
      res.json(customer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving customer'
      res.status(500).json({ message: errorMessage })
    }
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customer = await customerService.createCustomer(req.body)
      res.status(201).json(customer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating customer'
      res.status(400).json({ message: errorMessage })
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedCustomer = await customerService.updateCustomer(id, req.body)
      if (!updatedCustomer) {
        res.status(404).json({ message: 'customer not found' })
        return
      }
      res.json(updatedCustomer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating customer'
      res.status(500).json({ message: errorMessage })
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedCustomer = await customerService.deleteCustomer(id)
      if (!deletedCustomer) {
        res.status(404).json({ message: 'customer not found' })
        return
      }
      res.json({ message: 'customer deleted successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting customer'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const customerController = new CustomerController()
