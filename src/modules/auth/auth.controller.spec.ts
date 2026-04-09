import type { Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthController } from './auth.controller'
import type { AuthService } from './auth.service'

vi.mock('@/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_REFRESH_EXPIRES_IN: 604800,
  },
}))

describe('AuthController', () => {
  let controller: AuthController
  let mockAuthService: AuthService
  let mockResponse: Response
  let mockJson: ReturnType<typeof vi.fn>
  let mockStatus: ReturnType<typeof vi.fn>
  let mockCookie: ReturnType<typeof vi.fn>
  let mockClearCookie: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockJson = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ json: mockJson })
    mockCookie = vi.fn()
    mockClearCookie = vi.fn()

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      cookie: mockCookie,
      clearCookie: mockClearCookie,
    } as unknown as Response

    mockAuthService = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      refresh: vi.fn(),
      signOutCurrentSession: vi.fn(),
      signOutAllSession: vi.fn(),
    } as unknown as AuthService

    controller = new AuthController(mockAuthService)
  })

  describe('signInHandler', () => {
    it('should sign in and return access token', async () => {
      const mockReq = {
        body: { email: 'test@example.com', password: 'password123', deviceId: 'device-1' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      } as never

      vi.mocked(mockAuthService.signIn).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })

      await controller.signInHandler(mockReq, mockResponse)

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123', deviceId: 'device-1' },
        { ip: '127.0.0.1', userAgent: 'test-agent' },
      )
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          path: '/api/v1/auth/refresh',
        }),
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { accessToken: 'access-token' },
      })
    })
  })

  describe('signUpHandler', () => {
    it('should sign up and return access token', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          deviceId: 'device-1',
        },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      } as never

      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })

      await controller.signUpHandler(mockReq, mockResponse)

      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        },
        { ip: '127.0.0.1', userAgent: 'test-agent', deviceId: 'device-1' },
      )
      expect(mockStatus).toHaveBeenCalledWith(201)
    })
  })

  describe('refreshHandler', () => {
    it('should refresh tokens and return access token', async () => {
      const mockReq = {
        body: { deviceId: 'device-1' },
        cookies: { refresh_token: 'refresh-token' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      } as never

      vi.mocked(mockAuthService.refresh).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })

      await controller.refreshHandler(mockReq, mockResponse)

      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh-token', 'device-1', {
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      })
      expect(mockStatus).toHaveBeenCalledWith(200)
    })

    it('should return 401 if refresh token missing', async () => {
      const mockReq = {
        body: { deviceId: 'device-1' },
        cookies: {},
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      } as never

      mockStatus.mockReturnValue({ json: mockJson })
      vi.mocked(mockAuthService.refresh).mockRejectedValue(new Error('Should not be called'))

      await controller.refreshHandler(mockReq, mockResponse)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Missing refresh token',
      })
      expect(mockAuthService.refresh).not.toHaveBeenCalled()
    })
  })

  describe('signOutHandler', () => {
    it('should sign out and clear cookie', async () => {
      const mockReq = {
        user: { sub: 'user-1', sid: 'session-1', kid: 'key-1' },
      } as never

      vi.mocked(mockAuthService.signOutCurrentSession).mockResolvedValue()

      await controller.signOutHandler(mockReq, mockResponse)

      expect(mockAuthService.signOutCurrentSession).toHaveBeenCalledWith('session-1')
      expect(mockClearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object))
      expect(mockStatus).toHaveBeenCalledWith(200)
    })
  })

  describe('signOutAllHandler', () => {
    it('should sign out all sessions and clear cookie', async () => {
      const mockReq = {
        user: { sub: 'user-1', sid: 'session-1', kid: 'key-1' },
      } as never

      vi.mocked(mockAuthService.signOutAllSession).mockResolvedValue()

      await controller.signOutAllHandler(mockReq, mockResponse)

      expect(mockAuthService.signOutAllSession).toHaveBeenCalledWith('user-1')
      expect(mockClearCookie).toHaveBeenCalled()
    })
  })
})
