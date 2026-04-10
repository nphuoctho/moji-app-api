import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto'
import { SignInDto } from '@/modules/auth/dto/sign-in.dto'
import { SignUpDto } from '@/modules/auth/dto/sign-up.dto'
import {
  buildDataEnvelopeDto,
  ErrorEnvelopeDto,
  unauthorizedResponse,
  validation422Response,
} from '../responses'

const RefreshRequestDto = z
  .object({
    deviceId: z.uuid().meta({
      description: 'Device UUID',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
  })
  .meta({ id: 'RefreshRequestDto' })

const AuthDataEnvelopeDto = buildDataEnvelopeDto(AuthResponseDto).meta({
  id: 'AuthDataEnvelopeDto',
})

const EmptyDataEnvelopeDto = buildDataEnvelopeDto(z.null()).meta({
  id: 'EmptyDataEnvelopeDto',
})

export const authPaths: ZodOpenApiPathsObject = {
  '/auth/sign-up': {
    post: {
      tags: ['Auth'],
      summary: 'Register new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: SignUpDto,
          },
        },
      },
      responses: {
        [StatusCodes.CREATED]: {
          description: 'Registration successful',
          content: {
            'application/json': {
              schema: AuthDataEnvelopeDto,
            },
          },
        },
        [StatusCodes.CONFLICT]: {
          description: 'Email or username already exists',
          content: {
            'application/json': {
              schema: ErrorEnvelopeDto,
            },
          },
        },
        [StatusCodes.UNPROCESSABLE_ENTITY]: validation422Response,
      },
    },
  },
  '/auth/sign-in': {
    post: {
      tags: ['Auth'],
      summary: 'Sign in user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: SignInDto,
          },
        },
      },
      responses: {
        [StatusCodes.OK]: {
          description: 'Sign in successful',
          content: {
            'application/json': {
              schema: AuthDataEnvelopeDto,
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: unauthorizedResponse,
        [StatusCodes.UNPROCESSABLE_ENTITY]: validation422Response,
      },
    },
  },
  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      security: [{ refreshCookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: RefreshRequestDto,
          },
        },
      },
      responses: {
        [StatusCodes.OK]: {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: AuthDataEnvelopeDto,
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: unauthorizedResponse,
        [StatusCodes.UNPROCESSABLE_ENTITY]: validation422Response,
      },
    },
  },
  '/auth/sign-out': {
    post: {
      tags: ['Auth'],
      summary: 'Sign out current session',
      security: [{ bearerAuth: [] }],
      responses: {
        [StatusCodes.OK]: {
          description: 'Sign out successful',
          content: {
            'application/json': {
              schema: EmptyDataEnvelopeDto,
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: unauthorizedResponse,
      },
    },
  },
  '/auth/sign-out-all': {
    post: {
      tags: ['Auth'],
      summary: 'Sign out all user sessions',
      security: [{ bearerAuth: [] }],
      responses: {
        [StatusCodes.OK]: {
          description: 'All sessions revoked',
          content: {
            'application/json': {
              schema: EmptyDataEnvelopeDto,
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: unauthorizedResponse,
      },
    },
  },
}
