import { ValidationError } from 'express-validator'

export class RequestValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super()

    // * only because we are extending built in Error class
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }
}
