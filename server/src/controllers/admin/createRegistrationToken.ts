import zod, { type infer as ZodInfer } from 'zod'
import { decodeAuthBearerToken, isSuperAdminReq, type ServerHandler } from '../../lib.exports'
import { response, ServerError } from '../../core.exports'
import { RegistrationToken } from '../../models/RegistrationToken'
import { createRegistrationTokenErrorHandler } from './createRegistrationToken.error'

export const adminCreateRegistrationTokenQuerySchema = zod.object({
  auth: zod.string().optional(),
})

export interface AdminCreateRegistrationToken {
  query: ZodInfer<typeof adminCreateRegistrationTokenQuerySchema>
}

const handler: ServerHandler<AdminCreateRegistrationToken> = async function (req, reply) {
  const decToken = decodeAuthBearerToken(req.headers.authorization)
  if (!decToken.isAdmin) throw new ServerError('err_invalid_auth_admin')

  const { auth } = adminCreateRegistrationTokenQuerySchema.parse(req.query)
  const admin = isSuperAdminReq(auth)
  const token = new RegistrationToken({ admin })
  await token.save()
  return response(reply, { code: 'success_admin_createregistrationtoken', data: { code: token.code } })
}

export const createRegistrationTokenCtrl = {
  handler,
  errorHandler: createRegistrationTokenErrorHandler,
} as const
