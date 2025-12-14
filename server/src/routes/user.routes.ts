import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware'

export const userRouter = Router()

// Todas las rutas requieren autenticación
userRouter.use(authenticateToken)

// CRUD de usuarios (requiere ser admin)
userRouter.get('/', requireAdmin(), userController.getUsers)
userRouter.get('/:id', requireAdmin(), userController.getUserById)
userRouter.post('/', requireAdmin(), userController.createUser)
userRouter.put('/:id', requireAdmin(), userController.updateUser)
userRouter.delete('/:id', requireAdmin(), userController.deleteUser)

