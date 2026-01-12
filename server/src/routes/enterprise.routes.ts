import { Router } from 'express'
import { enterpriseController } from '../controllers/enterprise.controller'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware'

export const enterpriseRouter = Router()

enterpriseRouter.get('/', enterpriseController.getEnterprises)
enterpriseRouter.get('/:id', enterpriseController.getEnterpriseById)
enterpriseRouter.post('/', authenticateToken, requireAdmin(), enterpriseController.createEnterprise)
enterpriseRouter.put('/:id', authenticateToken, requireAdmin(), enterpriseController.updateEnterprise)
enterpriseRouter.delete('/:id', authenticateToken, requireAdmin(), enterpriseController.deleteEnterprise)
