import { Router } from 'express'
import { validate } from '@/shared/middlewares/validate.middleware'
import { authController } from './auth.controller'
import { refreshDto, signInDto, signUpDto } from './auth.validator'

const authRouter: Router = Router()

authRouter.post('/sign-in', validate(signInDto), authController.signInHandler)
authRouter.post('/sign-up', validate(signUpDto), authController.signUpHandler)
authRouter.post('/refresh', validate(refreshDto), authController.refreshHandler)

export { authRouter }
