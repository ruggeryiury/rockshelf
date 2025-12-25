import zod, { type infer as ZodInfer } from 'zod'
import { response, ServerError } from '../../core.exports'
import type { ServerHandler } from '../../lib.exports'
import { User } from '../../models/User'
import { userRegisterErrorHandler } from './register.error'
import { RegistrationToken } from '../../models/RegistrationToken'

export const userRegisterBodySchema = zod.object({
  // Delete this for any person to registrate
  code: zod.string().regex(/^[A-Za-z]{3}-[A-Za-z0-9]{4}$/),

  email: zod.email(),
  username: zod
    .string()
    .min(3)
    .max(32)
    // No spaces allowed
    .refine((arg) => (arg.match(/\s+/) === null ? true : false), { error: 'err_user_register_username_nospaceallowed', params: { pattern: '/\\s+/' } })
    // Real bad punctuation for URLs
    .refine((arg) => (arg.match(/\#|\%|\+/) === null ? true : false), { error: 'err_user_register_username_invalid_type1', params: { pattern: '/\\#|\\%|\\+/' } })
    // Cannot start or end with period, underscore, or hyphen
    .refine((arg) => (arg.match(/\.\.+|__+|--+/) === null ? true : false), { error: 'err_user_register_username_invalid_type2', params: { pattern: '/\\.\\.+|__+/' } }),
  profileName: zod.string().min(3).max(32),
  password: zod
    .string()
    .min(8)
    .max(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
})

export interface UserRegister {
  body: ZodInfer<typeof userRegisterBodySchema>
}

const handler: ServerHandler<UserRegister> = async function (req, reply) {
  const body = userRegisterBodySchema.parse(req.body)

  // Delete this for any person to registrate
  const regToken = await RegistrationToken.findByCode(body.code.toUpperCase())
  if (!regToken) throw new ServerError('err_admin_createregistrationtoken_invalidcode', null, { code: body.code.toUpperCase() })

  const user = new User(body)

  // Delete this for any person to registrate
  if (regToken.admin) user.isAdmin = true

  await user.checkRegistryCaseInsensitive()
  await user.save()

  // Delete this for any person to registrate
  await regToken.deleteOne()

  return response(reply, { code: 'success_user_register' })
}

export const userRegisterCtrl = {
  handler,
  errorHandler: userRegisterErrorHandler,
} as const
