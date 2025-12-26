import { ErrorHandlers } from '../../core.exports'
import type { ServerErrorHandler } from '../../lib.exports'
import type { CustomUploadFile } from './uploadFile'

export const customUploadFileErrorHandler: ServerErrorHandler<CustomUploadFile> = (error, req, reply) => {
  console.log(error)
  if (ErrorHandlers.bearerToken(error, reply)) return
  if (ErrorHandlers.generic(error, reply)) return
  return ErrorHandlers.unknown(error, reply)
}
