import { Request } from 'express'
import { configs } from '../configs'
import jwt from 'jsonwebtoken'

export class JwtService {
  static getJwtFromRequest(req: Request) {
    const token = this.extractTokenFromRequest(req)
    if (!token) {
      return null
    }
    return this.decodeJWT(token)
  }

  static extractTokenFromRequest(req: Request) {
    const TOKEN_PREFIX = 'Bearer '
    const auth = req.headers.authorization
    if (!auth) {
      throw new Error(`authorization isn't exist`)
    }
    return auth.includes(TOKEN_PREFIX) ? auth.split(TOKEN_PREFIX)[1] : auth
  }

  static decodeJWT(token: string) {
    try {
      return jwt.verify(token, configs.JWT_SECRET_KEY)
    } catch (error: any) {
      throw new Error(error)
    }
  }

  static createJWT(userId: string) {
    return jwt.sign(
      {
        id: userId,
      },
      configs.JWT_SECRET_KEY,
    )
  }
}
