import { Router } from 'express'
import { sendData } from '@/shared/utils/response.util'

const userRouter: Router = Router()

// userRouter.use(authenticate)

userRouter.get('/', (_req, res) => {
  return sendData(res, { message: 'List users endpoint' })
})

userRouter.get('/me', (_req, res) => {
  return sendData(res, { message: 'Profile' })
})

userRouter.get('/:userId', (req, res) => {
  return sendData(res, {
    message: 'Get user detail endpoint',
    userId: req.params.userId,
  })
})

export { userRouter }
