import { jwtVerify, SignJWT } from 'jose'
import { createSecretKey } from 'node:crypto'
import env from '../../env.ts'

export interface JwtPayload {
  id: string
  email: string
  username: string
}

export const generateToken = (payload: JwtPayload) => {
  const secret = env.JWT_SECRET
  const secretKEy = createSecretKey(secret, 'utf-8')

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('6h')
    .sign(secretKEy)
}

export const verifyToken = async (token: string) => {
  try {
    const secret = env.JWT_SECRET
    const secretKey = createSecretKey(secret, 'utf-8')
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as JwtPayload
  } catch (error) {
    console.error(error)
  }
}
