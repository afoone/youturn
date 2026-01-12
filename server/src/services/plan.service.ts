import { PlanDocument, Plan } from '../models/plan.model'
import { planProvider } from '../providers/plan.provider'

class PlanService {
  async getAllPlans(): Promise<PlanDocument[]> {
    return planProvider.getAllPlans()
  }

  async getPlanById(id: string): Promise<PlanDocument | null> {
    return planProvider.getPlanById(id)
  }

  async getPlanByCodigo(codigo: string): Promise<PlanDocument | null> {
    return planProvider.getPlanByCodigo(codigo)
  }

  async createPlan(planData: Partial<Plan>): Promise<PlanDocument> {
    // Validaciones
    if (!planData.codigo) {
      throw new Error('Missing required field: codigo')
    }
    if (!planData.descripcion) {
      throw new Error('Missing required field: descripcion')
    }
    // El precio puede ser 0 (gratis) o un valor positivo
    // Si no se especifica, se asume 0 (gratis)
    if (planData.precio === undefined || planData.precio === null) {
      planData.precio = 0
    }
    if (planData.precio < 0) {
      throw new Error('Invalid field: precio must be greater than or equal to 0')
    }
    if (planData.maxTicketPoints === undefined || planData.maxTicketPoints < 0) {
      throw new Error('Missing or invalid field: maxTicketPoints')
    }
    if (planData.maxUsuarios === undefined || planData.maxUsuarios < 0) {
      throw new Error('Missing or invalid field: maxUsuarios')
    }
    if (planData.maxServicios === undefined || planData.maxServicios < 0) {
      throw new Error('Missing or invalid field: maxServicios')
    }

    // Verificar si ya existe un plan con el mismo código
    const existingPlan = await this.getPlanByCodigo(planData.codigo)
    if (existingPlan) {
      throw new Error(`Ya existe un plan con el código: ${planData.codigo}`)
    }

    return planProvider.createPlan(planData)
  }

  async updatePlan(id: string, planData: Partial<Plan>): Promise<PlanDocument | null> {
    return planProvider.updatePlan(id, planData)
  }

  async deletePlan(id: string): Promise<PlanDocument | null> {
    return planProvider.deletePlan(id)
  }
}

export const planService = new PlanService()

