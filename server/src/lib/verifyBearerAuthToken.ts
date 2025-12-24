import { ServerError } from '../core.exports'

export const verifyBearerAuthToken = (authToken: string): string => {
  const split = authToken.split(' ')
  if (split.length !== 2) throw new ServerError('err_invalid_auth')
  const [key, token] = split
  if (key !== 'Bearer') throw new ServerError('err_invalid_auth')
  if (token.length === 0) throw new ServerError('err_invalid_auth')
  return token
}
