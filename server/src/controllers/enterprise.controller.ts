import { Request, Response } from 'express'
import { enterpriseService } from '../services/enterprise.service'

class EnterpriseController {
  async getEnterprises(req: Request, res: Response): Promise<void> {
    try {
      const enterprises = await enterpriseService.getEnterprises()
      res.json(enterprises)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving enterprises'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getEnterpriseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const enterprise = await enterpriseService.getEnterpriseById(id)
      if (!enterprise) {
        res.status(404).json({ message: 'enterprise not found' })
        return
      }
      res.json(enterprise)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving enterprise'
      res.status(500).json({ message: errorMessage })
    }
  }

  async createEnterprise(req: Request, res: Response): Promise<void> {
    try {
      const enterprise = await enterpriseService.createEnterprise(req.body)
      res.status(201).json(enterprise)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating enterprise'
      res.status(400).json({ message: errorMessage })
    }
  }

  async updateEnterprise(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedEnterprise = await enterpriseService.updateEnterprise(id, req.body)
      if (!updatedEnterprise) {
        res.status(404).json({ message: 'enterprise not found' })
        return
      }
      res.json(updatedEnterprise)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating enterprise'
      res.status(500).json({ message: errorMessage })
    }
  }

  async deleteEnterprise(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedEnterprise = await enterpriseService.deleteEnterprise(id)
      if (!deletedEnterprise) {
        res.status(404).json({ message: 'enterprise not found' })
        return
      }
      res.json({ message: 'enterprise deleted successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting enterprise'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const enterpriseController = new EnterpriseController()
