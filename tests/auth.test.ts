import request from 'supertest'
import type { NewUser } from '../src/db/schema.ts'
import app from '../src/server.ts'
import { cleanupDatabase, createTestUser } from './setup/dbHelpers.ts'

describe('Auth Endpoints', () => {
  afterEach(async () => {
    cleanupDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData: NewUser = {
        email: 'testemail@test.com',
        username: 'kareemgamaal',
        password: 'testttttt',
      }
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).not.toHaveProperty('password')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login an existing user with valid creds', async () => {
      const user = await createTestUser()
      console.log(user)
      const credentials = {
        email: user.user.email,
        password: user.rawPassword,
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).not.toHaveProperty('password')
    })
  })
})
