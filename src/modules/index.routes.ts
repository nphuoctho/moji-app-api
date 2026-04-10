import { Router } from 'express'
import { authenticate } from '@/shared/middlewares/auth.middleware'
import { sendData } from '@/shared/utils/response.util'
import { authRouter } from './auth/auth.module'
import { userRouter } from './user/user.module'

const router: Router = Router()

router.get('/', (_, res) => {
  return sendData(res, {
    status: 'ok',
    version: 'v1',
    name: 'moji-api-app',
  })
})

router.use('/auth', authRouter)

router.use(authenticate)

router.use('/users', userRouter)

export default router
