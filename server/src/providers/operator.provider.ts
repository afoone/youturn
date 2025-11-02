import { Operator, OperatorModel } from '../models/operator.model'

class OperatorProvider {
  async getOperators(): Promise<Operator[]> {
    return OperatorModel.find()
  }

  async getOperatorById(id: string): Promise<Operator | null> {
    return OperatorModel.findById(id)
  }

  async createOperator(data: Partial<Operator>): Promise<Operator> {
    return OperatorModel.create(data)
  }

  async updateOperator(id: string, data: Partial<Operator>): Promise<Operator | null> {
    return OperatorModel.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteOperator(id: string): Promise<Operator | null> {
    return OperatorModel.findByIdAndDelete(id)
  }
}

export const operatorProvider = new OperatorProvider()
