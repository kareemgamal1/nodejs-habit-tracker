import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class APIError extends Error {
  status: number
  details?: { field: string; message: string }[] | undefined
  issues?: ZodError['issues'] | undefined
  constructor(
    message: string,
    status: number,
    details?: { field: string; message: string }[] | undefined
  ) {
    super(message)
    this.status = status || 500
    this.details = details || []
  }
}

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = err.status
  let message = err.message
  let details = err.details

  if (status === 500) {
    message = 'Internal server error'
  } else if (status === 401) {
    message = 'Unauthorized'
  } else if (status === 403) {
    message = 'Forbidden'
  } else if (status === 404) {
    message = 'Not found'
  }

  res.status(status).json({
    message,
    error: message,
    errorDetails: details,
  })
  next()
}
