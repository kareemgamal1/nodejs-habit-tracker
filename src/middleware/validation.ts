import type { NextFunction, Request, Response } from 'express'
import { type ZodSchema, ZodError } from 'zod'
import { APIError } from './errorHandler.ts'

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body)
      req.body = validatedData
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(e)
        next(new APIError('Validation failed', 400, e.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))))
      }
      next(e)
    }
  }
}

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        next(new APIError('Invalid params', 400, e.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))))
      }
      next(e)
    }
  }
}

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        next(new APIError('Invalid Query Params', 400, e.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))))
      }
      next(e)
    }
  }
}
