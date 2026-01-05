import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth.middleware'

export const userRouter = Router()

// Todas las rutas requieren autenticación
userRouter.use(authenticateToken)

// CRUD de usuarios (requiere ser admin o ENTERPRISE_ADMIN)
// Solo admins pueden listar y eliminar usuarios
userRouter.get('/', requireAdmin(), userController.getUsers)
userRouter.delete('/:id', requireAdmin(), userController.deleteUser)

// ENTERPRISE_ADMIN puede ver, crear y editar usuarios (con restricciones)
userRouter.get('/:id', requireRole('ENTERPRISE_ADMIN', 'ADMIN'), userController.getUserById)
userRouter.post('/', requireRole('ENTERPRISE_ADMIN', 'ADMIN'), userController.createUser)
userRouter.put('/:id', requireRole('ENTERPRISE_ADMIN', 'ADMIN'), userController.updateUser)

