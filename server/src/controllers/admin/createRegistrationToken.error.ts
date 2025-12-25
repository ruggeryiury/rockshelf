import { ZodError } from 'zod'
import type { ServerErrorHandler } from '../../lib.exports'
import { ErrorHandlers, response } from '../../core.exports'
import type { AdminCreateRegistrationToken } from './createRegistrationToken'

export const createRegistrationTokenErrorHandler: ServerErrorHandler<AdminCreateRegistrationToken> = (error, req, reply) => {
  if (ErrorHandlers.generic(error, reply)) return
  if (ErrorHandlers.bearerToken(error, reply)) return
  return ErrorHandlers.unknown(error, reply)
}
