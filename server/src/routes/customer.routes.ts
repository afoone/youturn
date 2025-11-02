import { Router } from 'express'
import { customerController } from '../controllers/customer.controller'

const serviceRouter = Router()

// Rutas para los servicios
serviceRouter.get('/', customerController.getCustomers)
serviceRouter.get('/:uuid', customerController.getCustomerById)
serviceRouter.post('', customerController.createCustomer)
serviceRouter.put('/:uuid', customerController.updateCustomer)
serviceRouter.delete('/:uuid', customerController.deleteCustomer)

export default serviceRouter
