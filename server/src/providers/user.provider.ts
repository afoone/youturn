import { User, UserModel } from '../models/user.model'

class UserProvider {
  async getUsers(): Promise<User[]> {
    return UserModel.find().select('-password')
      .populate('enterprise')
      .populate('operator')
      .populate('services')
      .exec()
  }

  async getUserById(id: string): Promise<User | null> {
    return UserModel.findById(id).select('-password')
      .populate('enterprise')
      .populate('operator')
      .populate('services')
      .exec()
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return UserModel.findOne({ username })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email })
      .populate('enterprise')
      .populate('operator')
      .populate('services')
      .exec()
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = await UserModel.create(data)
    const populated = await UserModel.findById(user._id)
      .populate('enterprise')
      .populate('operator')
      .populate('services')
      .exec()
    return populated || user
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .populate('enterprise')
      .populate('operator')
      .populate('services')
      .exec()
    return user
  }

  async deleteUser(id: string): Promise<User | null> {
    return UserModel.findByIdAndDelete(id).select('-password')
  }
}

export const userProvider = new UserProvider()

