import { NextFunction, Request, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { JwtService } from '../services/Jwt'

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const jwt = JwtService.getJwtFromRequest(req) as JwtPayload
  if (!jwt.id) {
    throw new Error(`사용자 아이디가 없습니다.`)
  }
  req.userId = jwt.id
  next()
}
