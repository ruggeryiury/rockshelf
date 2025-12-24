import type { FastifyError, FastifyReply } from 'fastify'
import type { LiteralUnion } from 'type-fest'
import { isDev } from '../lib.exports'
import { type ReplyCodeNames, type DirectMessage, type HTTPCodes, type HTTPCodeNames, httpCodes } from './serverError'
import { codeMap, ErrorHandlers, type ErrorDiagnosticObject } from '../core.exports'
import { useDefaultOptions } from '../../../../use-default-options/dist'
import { MyObject } from 'node-lib'

export interface ServerReplyOptions {
  /**
   * A code of the error (status code and message will be retrieved from the internal code map), or an array with the status code and the custom message.
   */
  code: LiteralUnion<ReplyCodeNames, string> | DirectMessage
  /**
   * `OPTIONAL` Values that will be placed on the reply JSON object.
   */
  data?: Record<string, any> | null
  /**
   * `OPTIONAL` An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
   */
  messageValues?: Record<string, string> | null
}

export interface StandardResponseObject<T extends Record<string, any> | undefined = undefined> {
  statusCode: number
  statusName: string
  statusFullName: string
  serverCode: string
  message: string
  data?: T
}

/**
 * Builds and sends stardardized replies to user's requests throughout the server routes.
 * - - - -
 * @param {FastifyReply} reply The reply instance of the request.
 * @param {ServerReplyOptions} options
 * @returns {FastifyReply}
 */
export const response = (reply: FastifyReply, options: ServerReplyOptions): FastifyReply => {
  const { code, data, messageValues } = useDefaultOptions<ServerReplyOptions>(
    {
      code: 'err_unknown',
      data: null,
      messageValues: null,
    },
    options
  )

  const res = new MyObject<StandardResponseObject>()

  const isExplicitUnknownError = code === 'err_unknown'
  const sendErrorDiag = isExplicitUnknownError && isDev()

  if (isExplicitUnknownError) {
    res.set('statusCode', 500)
    res.set('statusName', 'Internal Server Error')
    res.set('statusFullName', '500 Internal Server Error')
    res.set('serverCode', code)
    res.set('message', isDev() ? `An unknown error occurred${data ? '' : ', send the error object as data for more details'}` : 'An unknown error occurred, please try again later')

    if (sendErrorDiag && data) {
      res.set('error', data as FastifyError)
      res.set('errDebug', ErrorHandlers.diagnoseErrors(data as FastifyError))
    }
    return reply.status(500).send(res.toObject())
  }

  if (Array.isArray(code)) {
    const statusCode = code[0]
    const statusName = httpCodes[code[0]]
    const statusFullName = `${statusCode} ${statusName}`
    const serverCode = 'UNKNOWN'
    const message = code[1]

    res.set('statusCode', statusCode)
    res.set('statusName', statusName)
    res.set('statusFullName', statusFullName)
    res.set('serverCode', serverCode)
    res.set('message', message)
  } else if (codeMap[code as ReplyCodeNames]) {
    const [statusCode, message] = codeMap[code as ReplyCodeNames]
    const statusName = httpCodes[statusCode]
    const statusFullName = `${statusCode} ${statusName}`
    const serverCode = code

    res.set('statusCode', statusCode)
    res.set('statusName', statusName)
    res.set('statusFullName', statusFullName)
    res.set('serverCode', serverCode)
    res.set('message', message)
  } else {
    const statusCode = 500
    const statusName = 'Internal Server Error'
    const statusFullName = `${statusCode} ${statusName}`
    const serverCode = code
    const message = code

    res.set('statusCode', statusCode)
    res.set('statusName', statusName)
    res.set('statusFullName', statusFullName)
    res.set('serverCode', serverCode)
    res.set('message', message)
  }

  if (messageValues) {
    const allKeys = Object.keys(messageValues)
    for (const key of allKeys) {
      const oldMessage = res.get('message') as string
      res.set('message', oldMessage.replaceAll(`\{\{${key}\}\}`, messageValues[key]))
    }
  }

  if (data) res.set('data', data)

  return reply.status(Array.isArray(code) ? code[0] : code in codeMap ? codeMap[code as keyof typeof codeMap][0] : 500).send(res.toObject())
}
