import z from 'zod'
import { SignInDto, SignUpDto } from './dto'

export const signUpDto = z.object({
  body: SignUpDto,
})

export const signInDto = z.object({
  body: SignInDto,
})

export const refreshDto = z.object({
  body: z.object({
    deviceId: z.uuid(),
  }),
})

export const signOutDto = z.object({})
