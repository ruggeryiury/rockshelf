import { ErrorHandlers } from '../../core.exports'
import type { ServerErrorHandler } from '../../lib.exports'
import type { UserProfile } from './profile'

export const userProfileErrorHandler: ServerErrorHandler<UserProfile> = (error, req, reply) => {
  if (ErrorHandlers.bearerToken(error, reply)) return
  if (ErrorHandlers.generic(error, reply)) return
  return ErrorHandlers.unknown(error, reply)
}
