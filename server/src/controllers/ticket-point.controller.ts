import { Request, Response } from 'express'
import { ticketPointService } from '../services/ticket-point.service'
import { AuthRequest } from '../middleware/auth.middleware'

class TicketPointController {
  async getTicketPoints(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ticketPoints = await ticketPointService.getTicketPoints(req.user)
      res.json(ticketPoints)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving ticket points'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getTicketPointById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const ticketPoint = await ticketPointService.getTicketPointById(id)
      if (!ticketPoint) {
        res.status(404).json({ message: 'Ticket point not found' })
        return
      }
      res.json(ticketPoint)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving ticket point'
      res.status(500).json({ message: errorMessage })
    }
  }

  async createTicketPoint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ticketPoint = await ticketPointService.createTicketPoint(req.body, req.user)
      res.status(201).json(ticketPoint)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating ticket point'
      res.status(400).json({ message: errorMessage })
    }
  }

  async updateTicketPoint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedTicketPoint = await ticketPointService.updateTicketPoint(id, req.body, req.user)
      if (!updatedTicketPoint) {
        res.status(404).json({ message: 'Ticket point not found' })
        return
      }
      res.json(updatedTicketPoint)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating ticket point'
      res.status(500).json({ message: errorMessage })
    }
  }

  async deleteTicketPoint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedTicketPoint = await ticketPointService.deleteTicketPoint(id, req.user)
      if (!deletedTicketPoint) {
        res.status(404).json({ message: 'Ticket point not found' })
        return
      }
      res.json({ message: 'Ticket point deleted successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting ticket point'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const ticketPointController = new TicketPointController()

