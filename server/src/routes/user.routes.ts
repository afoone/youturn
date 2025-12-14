import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authenticateToken, requireRole } from '../middleware/auth.middleware'

export const userRouter = Router()

// Todas las rutas requieren autenticación
userRouter.use(authenticateToken)

// CRUD de usuarios (requiere rol admin o APP_ADMIN)
userRouter.get('/', requireRole('admin', 'APP_ADMIN'), userController.getUsers)
userRouter.get('/:id', requireRole('admin', 'APP_ADMIN'), userController.getUserById)
userRouter.post('/', requireRole('admin', 'APP_ADMIN'), userController.createUser)
userRouter.put('/:id', requireRole('admin', 'APP_ADMIN'), userController.updateUser)
userRouter.delete('/:id', requireRole('admin', 'APP_ADMIN'), userController.deleteUser)

