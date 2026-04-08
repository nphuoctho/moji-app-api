import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticate } from './auth.middleware'
import { AppError } from './error.middleware'

vi.mock('@/config/env', () => ({
  env: {
    NODE_ENV: 'test',
  },
}))

vi.mock('@/modules/signing-key/signing-key.schema', () => ({
  SigningKeyModel: {
    findOne: vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    }),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    decode: vi.fn(),
    verify: vi.fn(),
  },
}))

describe('authenticate middleware', () => {
  let mockReq: Request & { user?: unknown }
  let mockRes: Response
  let mockNext: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = {
      headers: {},
    } as Request & { user?: unknown }
    mockRes = {} as Response
    mockNext = vi.fn()
  })

  it('should throw error if no authorization header', async () => {
    await authenticate(mockReq as Request, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
    const error = mockNext.mock.calls[0][0] as AppError
    expect(error.message).toBe('Unauthorized')
    expect(error.statusCode).toBe(401)
  })

  it('should throw error if authorization header does not start with Bearer', async () => {
    mockReq.headers.authorization = 'Basic token123'

    await authenticate(mockReq as Request, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
    const error = mockNext.mock.calls[0][0] as AppError
    expect(error.message).toBe('Unauthorized')
    expect(error.statusCode).toBe(401)
  })

  it('should throw error if token is invalid (no kid)', async () => {
    mockReq.headers.authorization = 'Bearer validtoken'
    const jwt = await import('jsonwebtoken')
    vi.mocked(jwt.default.decode).mockReturnValue(null)

    await authenticate(mockReq as Request, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
  })

  it('should throw error if signing key not found', async () => {
    mockReq.headers.authorization = 'Bearer validtoken'
    const jwt = await import('jsonwebtoken')
    vi.mocked(jwt.default.decode).mockReturnValue({ kid: 'key-1' })
    const { SigningKeyModel } = await import('@/modules/signing-key/signing-key.schema')
    vi.mocked(SigningKeyModel.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as never)

    await authenticate(mockReq as Request, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should set req.user and call next on success', async () => {
    mockReq.headers.authorization = 'Bearer validtoken'
    const jwt = await import('jsonwebtoken')
    const mockPayload = { sub: 'user-1', sid: 'session-1', kid: 'key-1' }
    vi.mocked(jwt.default.decode).mockReturnValue(mockPayload)
    const { SigningKeyModel } = await import('@/modules/signing-key/signing-key.schema')
    vi.mocked(SigningKeyModel.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ publicKey: 'mock-public-key' }),
    } as never)
    vi.mocked(jwt.default.verify).mockReturnValue(mockPayload)

    await authenticate(mockReq as Request, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledWith()
    expect(mockReq.user).toEqual(mockPayload)
  })
})
