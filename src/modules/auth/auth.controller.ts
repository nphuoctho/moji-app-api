import type { Request, Response } from 'express'
import { env } from '@/config/env'
import { type AuthService, authService } from './auth.service'

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

  async signInHandler(req: Request, res: Response) {
    const result = await this.authService.signIn(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    this.setRefreshCookie(res, result.refreshToken)
    return res.status(200).json({ accessToken: result.accessToken })
  }

  async refreshHandler(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) {
      return res.status(401).json({ message: 'Missing refresh token' })
    }

    const result = await this.authService.refresh(refreshToken, req.body.deviceId, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    this.setRefreshCookie(res, result.refreshToken)
    return res.status(200).json({ accessToken: result.accessToken })
  }
}

export const authController = new AuthController(authService)
