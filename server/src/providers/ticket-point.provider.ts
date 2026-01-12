import { TicketPointDocument, TicketPointModel, TicketPoint } from '../models/ticket-point.model'

class TicketPointProvider {
  async getTicketPoints(): Promise<TicketPointDocument[]> {
    return TicketPointModel.find()
      .populate('enterprise')
      .populate('services.service')
      .exec()
  }

  async getTicketPointsByEnterprise(enterpriseId: string): Promise<TicketPointDocument[]> {
    return TicketPointModel.find({ enterprise: enterpriseId })
      .populate('enterprise')
      .populate('services.service')
      .exec()
  }

  async getTicketPointById(id: string): Promise<TicketPointDocument | null> {
    return TicketPointModel.findById(id)
      .populate('enterprise')
      .populate('services.service')
      .exec()
  }

  async createTicketPoint(data: Partial<TicketPoint>): Promise<TicketPointDocument> {
    const ticketPoint = await TicketPointModel.create(data)
    await ticketPoint.populate('enterprise')
    await ticketPoint.populate('services.service')
    return ticketPoint
  }

  async updateTicketPoint(id: string, data: Partial<TicketPoint>): Promise<TicketPointDocument | null> {
    const updated = await TicketPointModel.findByIdAndUpdate(id, data, { new: true })
      .populate('enterprise')
      .populate('services.service')
      .exec()
    return updated
  }

  async deleteTicketPoint(id: string): Promise<TicketPointDocument | null> {
    return TicketPointModel.findByIdAndDelete(id)
  }
}

export const ticketPointProvider = new TicketPointProvider()

