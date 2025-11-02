import { Router } from 'express'
import { operatorController } from '../controllers/operator.controller'

const operatorRouter = Router()

// Rutas para los servicios
operatorRouter.get('/', operatorController.getOperators)
operatorRouter.get('/:id', operatorController.getOperatorById)
operatorRouter.post('', operatorController.createOperator)
operatorRouter.put('/:id', operatorController.updateOperator)
operatorRouter.delete('/:id', operatorController.deleteOperator)
operatorRouter.post('/:id/next-customer', operatorController.nextCustomer)

export default operatorRouter
