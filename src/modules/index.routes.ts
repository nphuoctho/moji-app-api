import { Router } from 'express'
import { authRouter } from './auth/auth.module'
import { userRouter } from './user/user.routes'

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
router.use('/users', userRouter)

export default router
