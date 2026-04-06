import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthRepository } from '../auth.repository'
import { AuthSessionModel } from '../auth-session.schema'
import type { AuthSessionPayload } from '../auth-session.types'

vi.mock('../auth-session.schema', () => ({
  AuthSessionModel: {
    create: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    updateMany: vi.fn(),
  },
}))

vi.mock('mongoose', () => ({
  default: {
    startSession: vi.fn().mockResolvedValue({
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    }),
  },
}))

describe('AuthRepository', () => {
  let repository: AuthRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new AuthRepository(AuthSessionModel)
  })

  describe('createSession', () => {
    it('should create a new session', async () => {
      const payload: AuthSessionPayload = {
        userId: '507f1f77bcf86cd799439011' as never,
        keyId: '507f1f77bcf86cd799439012' as never,
        deviceId: 'device-1',
        refreshTokenHash: 'hashed-token',
        jti: 'jti-123',
        expiresAt: new Date(),
      }

      vi.mocked(AuthSessionModel.create).mockResolvedValue([{}] as never)

      await repository.createSession(payload)

      expect(AuthSessionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: payload.userId,
          keyId: payload.keyId,
          deviceId: payload.deviceId,
          refreshTokenHash: payload.refreshTokenHash,
          jti: payload.jti,
          expiresAt: payload.expiresAt,
          revokedAt: null,
        }),
      )
    })
  })

  describe('findActiveSesssionByHash', () => {
    it('should find active session by refresh token hash', async () => {
      const mockSession = { _id: 'session-1', userId: 'user-1' }
      vi.mocked(AuthSessionModel.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockSession),
      } as never)

      const result = await repository.findActiveSesssionByHash('hashed-token')

      expect(AuthSessionModel.findOne).toHaveBeenCalledWith({
        refreshTokenHash: 'hashed-token',
        revokedAt: null,
      })
      expect(result).toEqual(mockSession)
    })

    it('should return null if no session found', async () => {
      vi.mocked(AuthSessionModel.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as never)

      const result = await repository.findActiveSesssionByHash('invalid-hash')

      expect(result).toBeNull()
    })
  })

  describe('revokedSession', () => {
    it('should revoke a session by ID', async () => {
      const mockSession = { _id: 'session-1', revokedAt: new Date() }
      vi.mocked(AuthSessionModel.findByIdAndUpdate).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockSession),
      } as never)

      const result = await repository.revokedSession('507f1f77bcf86cd799439011' as never)

      expect(AuthSessionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { revokedAt: expect.any(Date) },
        { new: true },
      )
      expect(result).toEqual(mockSession)
    })
  })

  describe('revokeSessionsByUserId', () => {
    it('should revoke all sessions for a user', async () => {
      vi.mocked(AuthSessionModel.updateMany).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ modifiedCount: 5 }),
      } as never)

      await repository.revokeSessionsByUserId('507f1f77bcf86cd799439011' as never)

      expect(AuthSessionModel.updateMany).toHaveBeenCalledWith(
        { userId: '507f1f77bcf86cd799439011', revokedAt: null },
        { revokedAt: expect.any(Date) },
      )
    })
  })
})
