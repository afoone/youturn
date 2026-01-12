import { Request, Response } from 'express'
import { planService } from '../services/plan.service'

class PlanController {
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await planService.getAllPlans()
      res.json(plans)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving plans'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const plan = await planService.getPlanById(id)
      if (!plan) {
        res.status(404).json({ message: 'Plan not found' })
        return
      }
      res.json(plan)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving plan'
      res.status(500).json({ message: errorMessage })
    }
  }

  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await planService.createPlan(req.body)
      res.status(201).json(plan)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating plan'
      // Si es un error de MongoDB (duplicado), devolver un mensaje más claro
      if (error.code === 11000) {
        res.status(400).json({ message: 'Ya existe un plan con este código' })
        return
      }
      res.status(400).json({ message: errorMessage, error: error.message })
    }
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedPlan = await planService.updatePlan(id, req.body)
      if (!updatedPlan) {
        res.status(404).json({ message: 'Plan not found' })
        return
      }
      res.json(updatedPlan)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating plan'
      res.status(500).json({ message: errorMessage })
    }
  }

  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedPlan = await planService.deletePlan(id)
      if (!deletedPlan) {
        res.status(404).json({ message: 'Plan not found' })
        return
      }
      res.json({ message: 'Plan deleted successfully' })
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting plan'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const planController = new PlanController()

