import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import type { Request, Response } from 'express'
import { db } from '../db/connection.ts'
import { users, type NewUser } from '../db/schema.ts'
import { generateToken } from '../utils/jwt.ts'
import { hashPassword } from '../utils/passwords.ts'

export const register = async (
  req: Request<any, NewUser, NewUser>,
  res: Response
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password)

    const [user] = await db
      .insert(users)
      .values({ ...req.body, password: hashedPassword })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createAt: users.createdAt,
      })

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return res.status(201).json({ message: 'User created', user, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isCorrectPassword = bcrypt.compare(password, user.password)

    if (!isCorrectPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = await generateToken({
      email,
      username: user.username,
      id: user.id,
    })

    return res.json({
      message: 'Login success',
      user: {
        name: user.firstName + ' ' + user.lastName,
      },
      token,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Smth went wrong' })
  }
}
