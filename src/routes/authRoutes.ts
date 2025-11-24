import { Router } from 'express'
import { z } from 'zod'
import { login, register } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'

const router = Router()

const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().nonempty().max(255),
})
router.post('/register', validateBody(registerSchema), register)

router.post('/login', validateBody(loginSchema), login)

export default router
