import type { Types } from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/shared/middlewares/error.middleware'
import type { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'
import type { SigningKeyService } from '../signing-key/signing-key.service'
import type { UserRepository } from '../user/user.repository'

vi.mock('bcrypt')
vi.mock('jsonwebtoken')
vi.mock('@/config/env', () => ({
  env: {
    JWT_ACCESS_EXPIRES_IN: 900,
    JWT_REFRESH_EXPIRES_IN: 604800,
    NODE_ENV: 'test',
  },
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockAuthRepository: AuthRepository
  let mockUserRepository: UserRepository
  let mockSigningKeyService: SigningKeyService

  beforeEach(() => {
    mockAuthRepository = {
      createSession: vi.fn(),
      findActiveSesssionByHash: vi.fn(),
      rotateRefreshSession: vi.fn(),
      revokedSession: vi.fn(),
      revokeSessionsByUserId: vi.fn(),
    } as unknown as AuthRepository

    mockUserRepository = {
      findUserByEmail: vi.fn(),
      findUserById: vi.fn(),
      existsUserByEmail: vi.fn(),
      existsUserByUsername: vi.fn(),
      createUser: vi.fn(),
    } as unknown as UserRepository

    mockSigningKeyService = {
      getActiveSigningKeyByUserId: vi.fn(),
      createSigningKey: vi.fn(),
      getSigningKeyById: vi.fn(),
      getPrivateKeyFromRecord: vi.fn(),
    } as unknown as SigningKeyService

    authService = new AuthService(mockAuthRepository, mockUserRepository, mockSigningKeyService)
  })

  describe('signIn', () => {
    it('should throw error if user not found', async () => {
      vi.mocked(mockUserRepository.findUserByEmail).mockResolvedValue(null)

      await expect(
        authService.signIn(
          { email: 'test@example.com', password: 'password123', deviceId: 'device-1' },
          { ip: '127.0.0.1' },
        ),
      ).rejects.toThrow(AppError)
    })

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011' as unknown as Types.ObjectId,
        email: 'test@example.com',
        passwordHash: '$2b$12$hashedpassword',
      }
      vi.mocked(mockUserRepository.findUserByEmail).mockResolvedValue(mockUser)
      const bcrypt = await import('bcrypt')
      vi.mocked(bcrypt.compare).mockResolvedValue(false)

      await expect(
        authService.signIn(
          { email: 'test@example.com', password: 'wrongpassword', deviceId: 'device-1' },
          { ip: '127.0.0.1' },
        ),
      ).rejects.toThrow(AppError)
    })
  })

  describe('signUp', () => {
    it('should throw error if email already taken', async () => {
      vi.mocked(mockUserRepository.existsUserByEmail).mockResolvedValue(true)

      await expect(
        authService.signUp(
          {
            email: 'test@example.com',
            username: 'testuser',
            password: 'password123',
            firstname: 'Test',
            lastname: 'User',
          },
          { ip: '127.0.0.1', deviceId: 'device-1' },
        ),
      ).rejects.toThrow(AppError)
    })

    it('should throw error if username already taken', async () => {
      vi.mocked(mockUserRepository.existsUserByEmail).mockResolvedValue(false)
      vi.mocked(mockUserRepository.existsUserByUsername).mockResolvedValue(true)

      await expect(
        authService.signUp(
          {
            email: 'test@example.com',
            username: 'existinguser',
            password: 'password123',
            firstname: 'Test',
            lastname: 'User',
          },
          { ip: '127.0.0.1', deviceId: 'device-1' },
        ),
      ).rejects.toThrow(AppError)
    })
  })

  describe('refresh', () => {
    it('should throw error if session not found', async () => {
      vi.mocked(mockAuthRepository.findActiveSesssionByHash).mockResolvedValue(null)

      await expect(
        authService.refresh('invalid-token', 'device-1', { ip: '127.0.0.1' }),
      ).rejects.toThrow()
    })

    it('should throw error if session expired', async () => {
      const expiredSession = {
        _id: '507f1f77bcf86cd799439011' as unknown as Types.ObjectId,
        deviceId: 'device-1',
        expiresAt: new Date(Date.now() - 1000),
      }
      vi.mocked(mockAuthRepository.findActiveSesssionByHash).mockResolvedValue(expiredSession)

      await expect(
        authService.refresh('valid-token', 'device-1', { ip: '127.0.0.1' }),
      ).rejects.toThrow()
    })
  })

  describe('signOutCurrentSession', () => {
    it('should call repository to revoke session', async () => {
      vi.mocked(mockAuthRepository.revokedSession).mockResolvedValue({} as never)

      await authService.signOutCurrentSession('507f1f77bcf86cd799439011')

      expect(mockAuthRepository.revokedSession).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011' as never,
      )
    })
  })

  describe('signOutAllSession', () => {
    it('should call repository to revoke all sessions', async () => {
      vi.mocked(mockAuthRepository.revokeSessionsByUserId).mockResolvedValue({} as never)

      await authService.signOutAllSession('507f1f77bcf86cd799439011')

      expect(mockAuthRepository.revokeSessionsByUserId).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011' as never,
      )
    })
  })
})
