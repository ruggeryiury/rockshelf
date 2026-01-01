import type { RouteOptions } from 'fastify'
import { decodeAuthBearerToken, type ServerHandler } from '../lib.exports'
import { response } from '../core.exports'
import { User } from '../models/User'
import { userProfileErrorHandler } from './userProfile.error'

export interface UserProfile {
  body: undefined
}

const handler: ServerHandler<UserProfile> = async function (req, reply) {
  const decToken = decodeAuthBearerToken(req.headers.authorization)
  const user = await User.findByDecodedToken(decToken)
  const data = {
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    profileName: user.profileName,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
  return response(reply, { code: 'ok', data })
  // return response(reply, { code: 'ok', data: { asdksjkajsk: data } })
}

export const userProfile = {
  method: ['GET', 'HEAD'],
  url: '/user/profile',
  logLevel: 'warn',
  handler,
  errorHandler: userProfileErrorHandler,
} as RouteOptions
