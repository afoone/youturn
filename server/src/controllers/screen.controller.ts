import { Request, Response } from 'express'
import { screenService } from '../services/screen.service'

class ScreenController {
  async getScreens(req: Request, res: Response): Promise<void> {
    try {
      const screens = await screenService.getScreens()
      res.json(screens)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving screens'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getScreenCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const customers = await screenService.getScreenCustomers(id)
      res.json(customers)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving screen customers'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getScreenById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const screen = await screenService.getScreenById(id)
      if (!screen) {
        res.status(404).json({ message: 'screen not found' })
        return
      }
      res.json(screen)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving screen'
      res.status(500).json({ message: errorMessage })
    }
  }

  async createScreen(req: Request, res: Response): Promise<void> {
    try {
      const screen = await screenService.createScreen(req.body)
      res.status(201).json(screen)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating screen'
      res.status(400).json({ message: errorMessage })
    }
  }

  async updateScreen(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedScreen = await screenService.updateScreen(id, req.body)
      if (!updatedScreen) {
        res.status(404).json({ message: 'screen not found' })
        return
      }
      res.json(updatedScreen)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating screen'
      res.status(500).json({ message: errorMessage })
    }
  }



  async deleteScreen(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedScreen = await screenService.deleteScreen(id)
      if (!deletedScreen) {
        res.status(404).json({ message: 'screen not found' })
        return
      }
      res.json({ message: 'screen deleted successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting screen'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const screenController = new ScreenController()
