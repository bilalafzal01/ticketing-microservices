import { Request, Response, NextFunction } from 'express'
import { RequestValidationError } from '../errors/request-validation-error'
import { DatabaseConnectionError } from '../errors/database-connection-error'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    const formattedErrors = err.errors.map((error) => ({
      message: error.msg,
      field: error.param,
    }))
    return res.status(400).json({ errors: formattedErrors })
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(500).json({ errors: [{ message: err.reason }] })
  }

  res.status(400).send({ errors: [{ message: 'Something went wrong' }] })
}
