import type { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { env } from '@/config/env'
import type { AuthenticatedRequest, ValidatedRequest } from '@/shared/types/request.types'
import { sendCreated, sendData, sendError, sendNoContent } from '@/shared/utils/response.util'
import { type AuthService, authService } from './auth.service'
import type { refreshDto, signInDto, signUpDto } from './auth.validator'

export class AuthController {
  private readonly REFRESH_TOKEN = 'refresh_token'
  private readonly COOKIE_PATH = '/api/v1/auth'

  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(this.REFRESH_TOKEN, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: this.COOKIE_PATH,
      maxAge: Number(env.JWT_REFRESH_EXPIRES_IN ?? 604800) * 1000,
    })
  }

  signInHandler = async (req: ValidatedRequest<typeof signInDto>, res: Response) => {
    const result = await this.authService.signIn(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    this.setRefreshCookie(res, result.refreshToken)
    sendData(res, { accessToken: result.accessToken })
  }

  signUpHandler = async (req: ValidatedRequest<typeof signUpDto>, res: Response) => {
    const { firstName, lastName, deviceId, ...rest } = req.body

    const result = await this.authService.signUp(
      {
        ...rest,
        firstName,
        lastName,
      },
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        deviceId,
      },
    )

    this.setRefreshCookie(res, result.refreshToken)
    sendCreated(res, { accessToken: result.accessToken })
  }

  refreshHandler = async (req: ValidatedRequest<typeof refreshDto>, res: Response) => {
    const refreshToken = req.cookies?.[this.REFRESH_TOKEN]
    if (!refreshToken) {
      sendError(res, {
        statusCode: StatusCodes.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
        message: 'Missing refresh token',
      })
      return
    }

    const result = await this.authService.refresh(refreshToken, req.body.deviceId, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    this.setRefreshCookie(res, result.refreshToken)
    sendData(res, { accessToken: result.accessToken })
  }

  signOutHandler = async (req: AuthenticatedRequest, res: Response) => {
    await this.authService.signOutCurrentSession(req.user.sid)

    res.clearCookie(this.REFRESH_TOKEN, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: this.COOKIE_PATH,
    })

    sendNoContent(res)
  }

  signOutAllHandler = async (req: AuthenticatedRequest, res: Response) => {
    await this.authService.signOutAllSession(req.user.sub)

    res.clearCookie(this.REFRESH_TOKEN, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: this.COOKIE_PATH,
    })

    sendNoContent(res)
  }
}

export const authController = new AuthController(authService)
