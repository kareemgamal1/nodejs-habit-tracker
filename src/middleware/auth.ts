import type { NextFunction, Request, Response } from 'express'

import { verifyToken, type JwtPayload } from '../utils/jwt.ts'

export interface AuthenticatedRequest<ReqBody = any> extends Request {
  user?: JwtPayload
  body: ReqBody
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized, login first' })
    }
    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch (e) {
    console.error(e)
    return res.status(403).json({ error: 'Forbidden' })
  }
}
