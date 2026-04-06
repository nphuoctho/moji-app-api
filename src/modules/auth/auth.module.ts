import { Router } from 'express'
import { authenticate } from '@/shared/middlewares/auth.middleware'
import { validate } from '@/shared/middlewares/validate.middleware'
import { withAuth } from '@/shared/utils/with-auth.util'
import { authController } from './auth.controller'
import { refreshDto, signInDto, signUpDto } from './auth.validator'

const authRouter: Router = Router()

/**
 * @swagger
 * /api/v1/auth/sign-in:
 *   post:
 *     summary: Sign in user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - deviceId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/sign-in', validate(signInDto), authController.signInHandler)

/**
 * @swagger
 * /api/v1/auth/sign-up:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - firstname
 *               - lastname
 *               - deviceId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               deviceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       409:
 *         description: Email or username already exists
 *         $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/sign-up', validate(signUpDto), authController.signUpHandler)

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *     cookies:
 *       refresh_token:
 *         type: string
 *         description: HTTP-only refresh token cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Missing or invalid refresh token
 *         $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/refresh', validate(refreshDto), authController.refreshHandler)

/**
 * @swagger
 * /api/v1/auth/sign-out:
 *   post:
 *     summary: Sign out current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sign out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/sign-out', authenticate, withAuth(authController.signOutHandler))

/**
 * @swagger
 * /api/v1/auth/sign-out-all:
 *   post:
 *     summary: Sign out all user sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/sign-out-all', authenticate, withAuth(authController.signOutAllHandler))

export { authRouter }
