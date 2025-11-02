import { Request, Response } from 'express'
import { operatorService } from '../services/operator.service'

class OperatorController {
  async getOperators(req: Request, res: Response): Promise<void> {
    try {
      const operators = await operatorService.getOperators()
      res.json(operators)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving operator'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getOperatorById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const operator = await operatorService.getOperatorById(id)
      if (!operator) {
        res.status(404).json({ message: 'operator not found' })
        return
      }
      res.json(operator)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving operator'
      res.status(500).json({ message: errorMessage })
    }
  }

  async createOperator(req: Request, res: Response): Promise<void> {
    try {
      const operator = await operatorService.createOperator(req.body)
      res.status(201).json(operator)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating operator'
      res.status(400).json({ message: errorMessage })
    }
  }

  async updateOperator(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedOperator = await operatorService.updateOperator(id, req.body)
      if (!updatedOperator) {
        res.status(404).json({ message: 'operator not found' })
        return
      }
      res.json(updatedOperator)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating operator'
      res.status(500).json({ message: errorMessage })
    }
  }

  async nextCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const nextCustomer = await operatorService.nextCustomer(id)
      res.json(nextCustomer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error getting next customer'
      res.status(500).json({ message: errorMessage })
    }
  }

  async waitingRoom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const waitingServices = await operatorService.waitingRoom(id)
      // Lógica para la sala de espera
      res.json(waitingServices)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error in waiting room'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getInServiceCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const inServiceCustomer = await operatorService.getInServiceCustomer(id)
      res.json(inServiceCustomer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error getting in-service customer'
      res.status(500).json({ message: errorMessage })
    }
  }

  async attendCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params
      const attendedCustomer = await operatorService.attendCustomer(customerId)
      res.json(attendedCustomer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error attending customer'
      res.status(500).json({ message: errorMessage })
    }
  }

  async completeService(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params
      const completedCustomer = await operatorService.completeService(customerId)
      res.json(completedCustomer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error completing service'
      res.status(500).json({ message: errorMessage })
    }
  }

  async deleteOperator(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedOperator = await operatorService.deleteOperator(id)
      if (!deletedOperator) {
        res.status(404).json({ message: 'operator not found' })
        return
      }
      res.json({ message: 'operator deleted successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting operator'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const operatorController = new OperatorController()
