import { db } from '../../src/db/connection.ts'
import {
  entries,
  habits,
  habitTags,
  tags,
  users,
  type NewHabit,
  type NewUser,
} from '../../src/db/schema.ts'
import { generateToken } from '../../src/utils/jwt.ts'
import { hashPassword } from '../../src/utils/passwords.ts'

import { randomUUID } from 'node:crypto'
export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const defaultData: NewUser = {
    email: `test-${randomUUID().slice(0, 8)}@test.com`,
    username: `test-${randomUUID().slice(0, 8)}`,
    password: 'adminpassword1234',
    firstName: 'Test',
    lastName: 'User',
    ...userData,
  }

  const hashedPassword = await hashPassword(defaultData.password)

  const [user] = await db
    .insert(users)
    .values({ ...defaultData, password: hashedPassword })
    .returning()

  const token = generateToken({
    username: user.username,
    email: user.email,
    id: user.id,
  })

  return { token, user, rawPassword: defaultData.password }
}

export const createTestHabit = async (
  userId: string,
  habitData: Partial<NewHabit> = {}
) => {
  const defaultData: NewHabit = {
    name: `Test habit ${Date.now()}`,
    description: 'A test habit',
    frequency: 'daily',
    userId,
    ...habitData,
  }

  const [habit] = await db.insert(habits).values(defaultData).returning()

  return habit
}

export const cleanupDatabase = async () => {
  await db.delete(entries)
  await db.delete(habitTags)
  await db.delete(habits)
  await db.delete(tags)
  await db.delete(users)
  console.log('Database cleaned up')
}
