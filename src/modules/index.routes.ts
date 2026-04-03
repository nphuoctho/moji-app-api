import { Router } from 'express'
import { authenticate } from '@/shared/middlewares/auth.middleware'
import { authRouter } from './auth/auth.module'
import { userRouter } from './user/user.module'

const router: Router = Router()

router.get('/', (_, res) => {
  return res.status(200).json({
    name: 'moji-api-app',
    version: 'v1',
    status: 'ok',
    endpoints: {
      users: '/api/v1/users',
    },
  })
})

router.use('/auth', authRouter)

router.use(authenticate)

router.use('/users', userRouter)

export default router
