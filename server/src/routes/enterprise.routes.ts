import { Router } from 'express'
import { enterpriseController } from '../controllers/enterprise.controller'

export const enterpriseRouter = Router()

enterpriseRouter.get('/', enterpriseController.getEnterprises)
enterpriseRouter.get('/:id', enterpriseController.getEnterpriseById)
enterpriseRouter.post('/', enterpriseController.createEnterprise)
enterpriseRouter.put('/:id', enterpriseController.updateEnterprise)
enterpriseRouter.delete('/:id', enterpriseController.deleteEnterprise)
