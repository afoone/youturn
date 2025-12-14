import { User, UserModel } from '../models/user.model'

class UserProvider {
  async getUsers(): Promise<User[]> {
    return UserModel.find().select('-password').populate('enterprise')
  }

  async getUserById(id: string): Promise<User | null> {
    return UserModel.findById(id).select('-password').populate('enterprise')
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return UserModel.findOne({ username })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email })
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = await UserModel.create(data)
    return user.toObject()
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).select('-password')
    return user
  }

  async deleteUser(id: string): Promise<User | null> {
    return UserModel.findByIdAndDelete(id).select('-password')
  }
}

export const userProvider = new UserProvider()

