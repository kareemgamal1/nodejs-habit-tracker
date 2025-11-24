import { cleanupDatabase, createTestUser } from './dbHelpers.ts'

describe('Test Database Setup', () => {
  test('should connect to the test database', async () => {
    const { user, token, rawPassword } = await createTestUser()

    expect(user).toBeDefined()
    expect(token).toBeDefined()
    expect(rawPassword).toBeDefined()

    await cleanupDatabase()
  })
})
