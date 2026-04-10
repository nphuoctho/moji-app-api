import z from 'zod'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'

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
