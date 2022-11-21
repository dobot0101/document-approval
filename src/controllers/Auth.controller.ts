import express, { NextFunction, Request, Response } from 'express'
import { body } from 'express-validator'
import Container from 'typedi'
import { checkValidationError } from '../common/functions'
import { AuthService, LoginInput, SignupInput } from '../services/Auth.service'

const router = express.Router()
const authService = Container.get(AuthService)

/**
 * 회원가입
 */
router.post(
  '/signup',
  [
    body('email').trim().isEmail(),
    body('password').trim().isString(),
    body('name').trim().isString(),
  ],
  checkValidationError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: SignupInput = req.body
      const createdUser = await authService.signup(input)
      res.status(200).json(createdUser)
    } catch (error) {
      next(error)
    }
  },
)

/**
 * 로그인
 */
router.post(
  '/login',
  [body('email').trim().isEmail(), body('password').trim().isString()],
  checkValidationError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: LoginInput = req.body
      const token = await authService.login(input)
      res.status(200).json({
        message: 'token is created',
        token,
      })
    } catch (error) {
      next(error)
    }
  },
)

export default router
