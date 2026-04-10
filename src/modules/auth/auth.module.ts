import { Router } from 'express'

import { authenticate } from '@/shared/middlewares/auth.middleware'
import { validate } from '@/shared/middlewares/validate.middleware'
import { withAuth } from '@/shared/utils/with-auth.util'

import { authController } from './auth.controller'
import { refreshDto, signInDto, signUpDto } from './auth.validator'

const authRouter: Router = Router()

authRouter.post('/registrations', validate(signUpDto), authController.signUpHandler)
authRouter.post('/sessions', validate(signInDto), authController.signInHandler)
authRouter.post('/access-tokens', validate(refreshDto), authController.refreshHandler)

authRouter.delete('/sessions/current', authenticate, withAuth(authController.signOutHandler))
authRouter.delete('/sessions', authenticate, withAuth(authController.signOutAllHandler))

export { authRouter }
