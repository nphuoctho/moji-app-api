import type { Types } from 'mongoose'
import { UserModel } from './user.schema'
import type { CreateUserPayload, UpdateUserPayload } from './user.types'

export class UserRepository {
  constructor(private readonly userModel: typeof UserModel) {}

  async findUserById(userId: Types.ObjectId) {
    return this.userModel.findById(userId).lean()
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).lean()
  }

  async findUserByUsername(username: string) {
    return this.userModel.findOne({ username }).lean()
  }

  async existsUserByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email }).lean()
    return count > 0
  }

  async existsUserByUsername(username: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ username }).lean()
    return count > 0
  }

  async createUser(payload: CreateUserPayload) {
    return this.userModel.create(payload)
  }

  async updateUserById(userId: Types.ObjectId, payload: UpdateUserPayload) {
    return this.userModel
      .findByIdAndUpdate(userId, { $set: payload }, { new: true, runValidators: true })
      .exec()
  }

  async deleteUseryById(userId: Types.ObjectId) {
    return this.userModel.findByIdAndDelete(userId).exec()
  }
}

export const userRepository = new UserRepository(UserModel)
