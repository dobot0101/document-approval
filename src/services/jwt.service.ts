import { Request } from 'express'
import { configs } from '../configs'
import jwt from 'jsonwebtoken'

export class JwtService {
  private JWT_SECRET_KEY
  constructor() {
    this.JWT_SECRET_KEY = configs.JWT_SECRET_KEY
  }
  getUserIdFromRequest(req: Request) {
    const token = this.extractTokenFromRequest(req)
    if (!token) {
      return null
    }
    return this.decodeJWT(token)
  }

  extractTokenFromRequest(req: Request) {
    const TOKEN_PREFIX = 'Bearer '
    const auth = req.headers.authorization
    if (!auth) {
      throw new Error(`authorization isn't exist`)
    }
    return auth.includes(TOKEN_PREFIX) ? auth.split(TOKEN_PREFIX)[1] : auth
  }

  decodeJWT(token: string) {
    try {
      const decodedToken = jwt.verify(token, this.JWT_SECRET_KEY)
      return decodedToken
    } catch (error) {
      throw error
    }
  }

  createJWT(userId: string) {
    return jwt.sign(
      {
        id: userId,
      },
      this.JWT_SECRET_KEY,
    )
  }
}
