import { Router } from 'express'
import { authenticate } from '@/shared/middlewares/auth.middleware'
import { validate } from '@/shared/middlewares/validate.middleware'
import { withAuth } from '@/shared/utils/with-auth.util'
import { authController } from './auth.controller'
import { refreshDto, signInDto, signUpDto } from './auth.validator'

const authRouter: Router = Router()

authRouter.post('/sign-in', validate(signInDto), authController.signInHandler)
authRouter.post('/sign-up', validate(signUpDto), authController.signUpHandler)
authRouter.post('/refresh', validate(refreshDto), authController.refreshHandler)

authRouter.post('/sign-out', authenticate, withAuth(authController.signOutHandler))
authRouter.post('/sign-out-all', authenticate, withAuth(authController.signOutAllHandler))

export { authRouter }
