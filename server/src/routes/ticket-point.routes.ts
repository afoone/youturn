import { Router } from 'express'
import { ticketPointController } from '../controllers/ticket-point.controller'
import { authenticateToken, requireRole } from '../middleware/auth.middleware'

const ticketPointRouter = Router()

// Todas las rutas requieren autenticación
ticketPointRouter.use(authenticateToken)

// GET: Listar ticket points (admin ve todos, ENTERPRISE_ADMIN solo los de su empresa)
ticketPointRouter.get('/', ticketPointController.getTicketPoints)

// GET: Obtener un ticket point por ID
ticketPointRouter.get('/:id', ticketPointController.getTicketPointById)

// POST: Crear ticket point (solo admin y ENTERPRISE_ADMIN)
ticketPointRouter.post('/', requireRole('ENTERPRISE_ADMIN', 'admin'), ticketPointController.createTicketPoint)

// PUT: Actualizar ticket point (solo admin y ENTERPRISE_ADMIN)
ticketPointRouter.put('/:id', requireRole('ENTERPRISE_ADMIN', 'admin'), ticketPointController.updateTicketPoint)

// DELETE: Eliminar ticket point (solo admin y ENTERPRISE_ADMIN)
ticketPointRouter.delete('/:id', requireRole('ENTERPRISE_ADMIN', 'admin'), ticketPointController.deleteTicketPoint)

export default ticketPointRouter

