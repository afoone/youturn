import { Request, Response } from 'express'
import { authService } from '../services/auth.service'

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, roles, enterpriseId, admin, nombre, apellidos, comentario } = req.body

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' })
        return
      }

      const isAdmin = admin === true
      // Si no es admin, enterpriseId es requerido
      if (!isAdmin && !enterpriseId) {
        res.status(400).json({ message: 'Enterprise is required for non-admin users' })
        return
      }

      const result = await authService.register(email, password, roles || [], enterpriseId, isAdmin, nombre, apellidos, comentario)
      res.status(201).json(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error registering user'
      res.status(400).json({ message: errorMessage })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' })
        return
      }

      const result = await authService.login(email, password)
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

