import { PlanDocument, PlanModel, Plan } from '../models/plan.model'

class PlanProvider {
  async getAllPlans(): Promise<PlanDocument[]> {
    return PlanModel.find().exec()
  }

  async getPlanById(id: string): Promise<PlanDocument | null> {
    return PlanModel.findById(id).exec()
  }

  async getPlanByCodigo(codigo: string): Promise<PlanDocument | null> {
    return PlanModel.findOne({ codigo }).exec()
  }

  async createPlan(data: Partial<Plan>): Promise<PlanDocument> {
    const plan = await PlanModel.create(data)
    return plan
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<PlanDocument | null> {
    const updated = await PlanModel.findByIdAndUpdate(id, data, { new: true }).exec()
    return updated
  }

  async deletePlan(id: string): Promise<PlanDocument | null> {
    return PlanModel.findByIdAndDelete(id).exec()
  }
}

export const planProvider = new PlanProvider()

