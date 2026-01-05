import { Request, Response } from 'express'
import { userService } from '../services/user.service'
import { AuthRequest } from '../middleware/auth.middleware'

class UserController {
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getUsers()
      res.json(users)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving users'
      res.status(500).json({ message: errorMessage })
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const user = await userService.getUserById(id)
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

  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const requestingUser: { userId: string; email: string; roles: string[]; admin: boolean; enterpriseId?: string } | undefined = req.user || undefined
      const user = await userService.createUser(req.body, requestingUser)
      res.status(201).json(user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating user'
      res.status(400).json({ message: errorMessage })
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const requestingUser: { userId: string; email: string; roles: string[]; admin: boolean; enterpriseId?: string } | undefined = req.user || undefined
      const updatedUser = await userService.updateUser(id, req.body, requestingUser)
      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      res.json(updatedUser)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating user'
      res.status(500).json({ message: errorMessage })
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deletedUser = await userService.deleteUser(id)
      if (!deletedUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting user'
      res.status(500).json({ message: errorMessage })
    }
  }
}

export const userController = new UserController()

