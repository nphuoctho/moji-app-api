import { Router } from 'express'
import { authController } from './auth.controller'

const authRouter: Router = Router()

authRouter.post('/sign-in', authController.signInHandler)
authRouter.post('/refresh', authController.refreshHandler)

export { authRouter }
