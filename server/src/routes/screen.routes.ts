import { Router } from 'express'
import { screenController } from '../controllers/screen.controller'

const screenRouter = Router()

// Rutas para los servicios
screenRouter.get('/', screenController.getScreens)
screenRouter.get('/:id', screenController.getScreenById)
screenRouter.get('/:id/customers', screenController.getScreenCustomers)
screenRouter.post('', screenController.createScreen)
screenRouter.put('/:id', screenController.updateScreen)
screenRouter.delete('/:id', screenController.deleteScreen)

export default screenRouter
