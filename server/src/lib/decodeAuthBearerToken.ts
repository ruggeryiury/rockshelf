import { ServerError } from '../core.exports'
import { jwtVerify } from './jwt'

export interface BearerDecodedTokenObject {
  id: string
  isAdmin: boolean
  iat: number
  exp: number
}

export const decodeAuthBearerToken = (authToken?: string): BearerDecodedTokenObject => {
  if (!authToken) throw new ServerError('err_auth_required')
  const split = authToken.split(' ')
  if (split.length !== 2) throw new ServerError('err_invalid_auth_format')
  const [key, token] = split
  if (key !== 'Bearer') throw new ServerError('err_invalid_auth_format')
  if (token.length === 0) throw new ServerError('err_invalid_auth_format')
  const decToken = jwtVerify(Buffer.from(token, 'base64').toString()) as BearerDecodedTokenObject
  return decToken
}
