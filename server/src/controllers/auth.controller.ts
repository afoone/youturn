import { Request, Response } from 'express'
import { authService } from '../services/auth.service'

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, roles } = req.body

      if (!username || !email || !password) {
        res.status(400).json({ message: 'Username, email, and password are required' })
        return
      }

      const result = await authService.register(username, email, password, roles || [])
      res.status(201).json(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error registering user'
      res.status(400).json({ message: errorMessage })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' })
        return
      }

      const result = await authService.login(username, password)
      res.json(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials'
      res.status(401).json({ message: errorMessage })
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // El middleware de autenticación debería haber agregado req.user
      const userId = (req as any).user?.userId
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' })
        return
      }

      const user = await authService.getCurrentUser(userId)
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.json(user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving user'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const authController = new AuthController()

