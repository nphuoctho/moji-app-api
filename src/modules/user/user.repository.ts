import type { Types } from 'mongoose'
import { UserModel } from './user.schema'

export class UserRepository {
  constructor(private readonly userModel: typeof UserModel) {}

  async findUserById(userId: Types.ObjectId) {
    return this.userModel.findById({ userId })
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec()
  }

  async createUser()
}

export const userRepository = new UserRepository(UserModel)
