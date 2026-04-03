import type { Response } from 'express'
import { env } from '@/config/env'
import type { AuthenticatedRequest, ValidatedRequest } from '@/shared/types/request.types'
import { sendError, sendSuccess } from '@/shared/utils/response.util'
import { type AuthService, authService } from './auth.service'
import type { refreshDto, signInDto, signUpDto } from './auth.validator'

export class AuthController {
  private readonly REFRESH_TOKEN = 'refresh_token'

  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(this.REFRESH_TOKEN, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: Number(env.JWT_REFRESH_EXPIRES_IN ?? 604800) * 1000,
    })
  }

  signInHandler = async (req: ValidatedRequest<typeof signInDto>, res: Response) => {
    const result = await this.authService.signIn(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    this.setRefreshCookie(res, result.refreshToken)
    sendSuccess(res, { accessToken: result.accessToken }, 200)
  }

  signUpHandler = async (req: ValidatedRequest<typeof signUpDto>, res: Response) => {
    const { firstname, lastname, deviceId, ...rest } = req.body

    const result = await this.authService.signUp(
      {
        ...rest,
        firstname,
        lastname,
      },
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        deviceId,
      },
    )

    this.setRefreshCookie(res, result.refreshToken)
    sendSuccess(res, { accessToken: result.accessToken }, 201)
  }

  refreshHandler = async (req: ValidatedRequest<typeof refreshDto>, res: Response) => {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) sendError(res, 'Missing refresh token', 401)

    const result = await this.authService.refresh(refreshToken, req.body.deviceId, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    this.setRefreshCookie(res, result.refreshToken)
    sendSuccess(res, { accessToken: result.accessToken }, 200)
  }

  signOutHandler = async (req: AuthenticatedRequest, res: Response) => {
    await this.authService.signOutCurrentSession(req.user.sid)

    res.clearCookie(this.REFRESH_TOKEN, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
    })

    sendSuccess(res, null, 200)
  }

  signOutAllHandler = async (req: AuthenticatedRequest, res: Response) => {
    await this.authService.signOutAllSession(req.user.sub)

    res.clearCookie(this.REFRESH_TOKEN, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
    })

    sendSuccess(res, null, 200)
  }
}

export const authController = new AuthController(authService)
