import { Router } from 'express'

const userRouter: Router = Router()

userRouter.get('/', (_req, res) => {
  return res.status(200).json({
    message: 'List users endpoint',
  })
})

userRouter.get('/:userId', (req, res) => {
  return res.status(200).json({
    message: 'Get user detail endpoint',
    userId: req.params.userId,
  })
})

export { userRouter }
