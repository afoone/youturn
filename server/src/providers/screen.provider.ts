import { ScreenDocument, ScreenModel } from "../models/screen.model"

class ScreenProvider {
  async getScreens(): Promise<ScreenDocument[]> {
    return ScreenModel.find()
  }

  async getScreenById(id: string): Promise<ScreenDocument | null> {
    return ScreenModel.findById(id)
  }

  async createScreen(data: Partial<Screen>): Promise<ScreenDocument> {
    return ScreenModel.create(data)
  }

  async updateScreen(id: string, data: Partial<Screen>): Promise<ScreenDocument | null> {
    return ScreenModel.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteScreen(id: string): Promise<ScreenDocument | null> {
    return ScreenModel.findByIdAndDelete(id)
  }
  
}

export const screenProvider = new ScreenProvider()
