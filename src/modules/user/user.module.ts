import { Router } from 'express'

const userRouter: Router = Router()

// userRouter.use(authenticate)

userRouter.get('/', (_req, res) => {
  return res.status(200).json({
    message: 'List users endpoint',
  })
})

userRouter.get('/me', (_req, res) => {
  res.status(200).json({ data: 'Profile' })
})

userRouter.get('/:userId', (req, res) => {
  return res.status(200).json({
    message: 'Get user detail endpoint',
    userId: req.params.userId,
  })
})

export { userRouter }
