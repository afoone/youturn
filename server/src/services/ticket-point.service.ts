import { ticketPointProvider } from '../providers/ticket-point.provider'
import { TicketPointDocument, TicketPoint } from '../models/ticket-point.model'
import { AuthRequest } from '../middleware/auth.middleware'

class TicketPointService {
  async getTicketPoints(requestingUser?: AuthRequest['user']): Promise<TicketPointDocument[]> {
    // Si es ENTERPRISE_ADMIN, solo devolver los de su empresa
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      return ticketPointProvider.getTicketPointsByEnterprise(requestingUser.enterpriseId)
    }
    // Si es admin, devolver todos
    return ticketPointProvider.getTicketPoints()
  }

  async getTicketPointById(id: string): Promise<TicketPointDocument | null> {
    return ticketPointProvider.getTicketPointById(id)
  }

  async createTicketPoint(
    data: Partial<TicketPoint>,
    requestingUser?: AuthRequest['user']
  ): Promise<TicketPointDocument> {
    // Si es ENTERPRISE_ADMIN, forzar la empresa a la suya
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      data.enterprise = requestingUser.enterpriseId as any
    }
    return ticketPointProvider.createTicketPoint(data)
  }

  async updateTicketPoint(
    id: string,
    data: Partial<TicketPoint>,
    requestingUser?: AuthRequest['user']
  ): Promise<TicketPointDocument | null> {
    // Si es ENTERPRISE_ADMIN, asegurar que solo puede actualizar los de su empresa
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      const existing = await ticketPointProvider.getTicketPointById(id)
      if (!existing) return null
      
      const existingEnterpriseId = existing.enterprise.toString()
      if (existingEnterpriseId !== requestingUser.enterpriseId) {
        throw new Error('You can only update ticket points from your own enterprise')
      }
      
      // Forzar la empresa a la suya
      data.enterprise = requestingUser.enterpriseId as any
    }
    return ticketPointProvider.updateTicketPoint(id, data)
  }

  async deleteTicketPoint(
    id: string,
    requestingUser?: AuthRequest['user']
  ): Promise<TicketPointDocument | null> {
    // Si es ENTERPRISE_ADMIN, asegurar que solo puede eliminar los de su empresa
    if (requestingUser && !requestingUser.admin && requestingUser.enterpriseId) {
      const existing = await ticketPointProvider.getTicketPointById(id)
      if (!existing) return null
      
      const existingEnterpriseId = existing.enterprise.toString()
      if (existingEnterpriseId !== requestingUser.enterpriseId) {
        throw new Error('You can only delete ticket points from your own enterprise')
      }
    }
    return ticketPointProvider.deleteTicketPoint(id)
  }
}

export const ticketPointService = new TicketPointService()

