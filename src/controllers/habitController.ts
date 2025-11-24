import { and, desc, eq, sql } from 'drizzle-orm'
import type { NextFunction, Response } from 'express'
import { db } from '../db/connection.ts'
import { habits, habitTags, tags } from '../db/schema.ts'
import { type AuthenticatedRequest } from '../middleware/auth.ts'
import type { NewHabitZod } from '../routes/habitRoutes.ts'
import { APIError } from '../middleware/errorHandler.ts'

export const createHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body
    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          name,
          description,
          frequency,
          targetCount,
          userId: req.user.id,
        })
        .returning()

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId) => ({
          habitId: newHabit.id,
          tagId,
        }))

        await tx.insert(habitTags).values(habitTagValues)
      }

      return newHabit
    })

    res.status(201).json({ message: 'Habit created', habit: result })
  } catch (e) {
    console.error(e)
    next(new APIError('Internal server error', 500, []))
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user

    const userHabitsWithTags = await db
      .select({
        id: habits.id,
        name: habits.name,
        description: habits.description,
        frequency: habits.frequency,
        tags: sql`json_agg(json_build_object('id', ${tags.id}, 'name', ${tags.name}, 'color', ${tags.color}))`,
      })
      .from(habits)
      .leftJoin(habitTags, eq(habitTags.habitId, habits.id))
      .leftJoin(tags, eq(tags.id, habitTags.tagId))
      .where(eq(habits.userId, id))
      .groupBy(habits.id)
      .orderBy(desc(habits.createdAt))

    res.status(200).json({ message: 'Success', habits: userHabitsWithTags })
  } catch (error) {
    console.error(error)
    next(new APIError('Internal server error', 500, []))
  }
}

export const getUserHabit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const habit = await db.query.habits.findFirst({
      where: eq(habitTags.id, id),
    })

    res.status(200).json({ message: 'Success', habit })
  } catch (error) {
    console.log(error)
    next(new APIError('Internal server error', 500, []))
  }
}

export const updateHabit = async (
  req: AuthenticatedRequest<Partial<NewHabitZod>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { tagIds, ...newHabitData } = req.body

    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await db
        .update(habits)
        .set({ ...newHabitData, updatedAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
        .returning()

      if (!updatedHabit) {
        next(new APIError('Habit not found in your list', 404, []))
      }

      if (!!tagIds) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId) => ({
            habitId: id,
            tagId,
          }))

          await tx.insert(habitTags).values(habitTagValues)
        }
      }

      //  Fetch habit + tags together
      const habitWithTags = await tx
        .select({
          id: habits.id,
          name: habits.name,
          description: habits.description,
          frequency: habits.frequency,
          targetCount: habits.targetCount,
          isActive: habits.isActive,
          updatedAt: habits.updatedAt,
          tags: sql`json_agg(json_build_object('id', ${tags.id}, 'name', ${tags.name}, 'color', ${tags.color}))`.mapWith(
            JSON.parse
          ),
        })
        .from(habits)
        .leftJoin(habitTags, eq(habitTags.habitId, habits.id))
        .leftJoin(tags, eq(tags.id, habitTags.tagId))
        .where(eq(habits.id, id))
        .groupBy(habits.id)
        .then((rows) => rows[0])

      return habitWithTags
    })

    res.status(200).json({ message: 'Habit updated', habit: result })
  } catch (error) {
    console.log(error)
    next(new APIError('Internal server error', 500, []))
  }
}
