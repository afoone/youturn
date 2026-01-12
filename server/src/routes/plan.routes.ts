import { Router } from 'express'
import { planController } from '../controllers/plan.controller'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware'

const planRouter = Router()

// GET: Listar planes (público para la landing page)
planRouter.get('/', planController.getPlans)

// El resto de rutas requieren autenticación
planRouter.use(authenticateToken)

// GET: Obtener un plan por ID
planRouter.get('/:id', planController.getPlanById)

// POST: Crear plan (solo admin)
planRouter.post('/', requireAdmin(), planController.createPlan)

// PUT: Actualizar plan (solo admin)
planRouter.put('/:id', requireAdmin(), planController.updatePlan)

// DELETE: Eliminar plan (solo admin)
planRouter.delete('/:id', requireAdmin(), planController.deletePlan)

export default planRouter

