import { Router } from 'express'
import { z } from 'zod'
import { getUserHabit, getUserHabits, updateHabit } from '../controllers/habitController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'


const createHabitSchema = z.object({
  name: z.string(),
  description: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  targetCount: z.number().min(1),
  tagIds: z.array(z.string()).optional(),
})

export const updateHabitSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetCount: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
})

export type NewHabitZod= z.infer<typeof updateHabitSchema>

const completeParamsSchema = z.object({
  id: z.string().max(3),
})

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)

router.patch('/:id', validateBody(updateHabitSchema), updateHabit)

router.get('/:id', getUserHabit)

router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.status(201).json({ message: 'created habit' })
})

router.delete('/:id', (req, res) => {
  res.json({ message: 'deleted habit' })
})

router.post(
  '/:id/complete',
  validateParams(completeParamsSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.status(201).json({ message: 'completed habit' })
  }
)

export default router
