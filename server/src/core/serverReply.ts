import type { FastifyReply } from 'fastify'
import type { LiteralUnion } from 'type-fest'
import { isDev } from '../lib.exports'
import { type ReplyCodeNames, type DirectMessage, type HTTPCodes, type HTTPCodeNames, httpCodes } from './serverError'
import { codeMap } from '../core.exports'

/**
 * Builds and sends stardardized replies to user's requests throughout the server routes.
 * - - - -
 * @param {FastifyReply} reply The reply instance of the request.
 * @param {LiteralUnion<ReplyCodeNames, string> | DirectMessage} codeOrMessage A code of the error (status code and message will be retrieved from the internal code map), or an array with the status code and the custom message.
 * @param {Record<string, any> | null} [data] `OPTIONAL` Values that will be placed on the reply JSON object.
 * @param {Record<string, string>} [messageValues] `OPTIONAL` An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
 * @returns {FastifyReply}
 */
export const serverReply = (reply: FastifyReply, codeOrMessage: LiteralUnion<ReplyCodeNames, string> | DirectMessage, data?: Record<string, any> | null, messageValues?: Record<string, string>): FastifyReply => {
  const isExplicitUnknownError = codeOrMessage === 'err_unknown'
  const sendDataOnError = isExplicitUnknownError && isDev()

  const sendObj = new Map()

  if (isExplicitUnknownError) {
    sendObj.set('statusCode', 500)
    sendObj.set('statusName', 'Internal Server Error')
    sendObj.set('statusFullName', '500 Internal Server Error')
    sendObj.set('serverCode', codeOrMessage)
    sendObj.set('message', isDev() ? `An unknown error occurred${data ? '' : ', send the error object as data for more details'}` : 'An unknown error occurred, please try again later')

    if (sendDataOnError && data) sendObj.set('data', data)

    return reply.status(500).send(Object.fromEntries(sendObj.entries()))
  }

  if (Array.isArray(codeOrMessage)) {
    const statusCode = codeOrMessage[0]
    const statusName = httpCodes[codeOrMessage[0]]
    const statusFullName = `${statusCode} ${statusName}`
    const serverCode = 'UNKNOWN'
    const message = codeOrMessage[1]

    sendObj.set('statusCode', statusCode)
    sendObj.set('statusName', statusName)
    sendObj.set('statusFullName', statusFullName)
    sendObj.set('serverCode', serverCode)
    sendObj.set('message', message)
  } else if (codeMap[codeOrMessage as ReplyCodeNames] && codeOrMessage in codeMap) {
    const statusCode = codeMap[codeOrMessage as ReplyCodeNames][0]
    const statusName = httpCodes[codeMap[codeOrMessage as ReplyCodeNames][0]]
    const statusFullName = `${statusCode} ${statusName}`
    const serverCode = codeOrMessage
    const message = codeMap[codeOrMessage as ReplyCodeNames][1]

    sendObj.set('statusCode', statusCode)
    sendObj.set('statusName', statusName)
    sendObj.set('statusFullName', statusFullName)
    sendObj.set('serverCode', serverCode)
    sendObj.set('message', message)
  } else {
    const statusCode = 500
    const statusName = 'Internal Server Error'
    const statusFullName = `${statusCode} ${statusName}`
    const serverCode = codeOrMessage
    const message = codeOrMessage

    sendObj.set('statusCode', statusCode)
    sendObj.set('statusName', statusName)
    sendObj.set('statusFullName', statusFullName)
    sendObj.set('serverCode', serverCode)
    sendObj.set('message', message)
  }

  if (messageValues) {
    const allKeys = Object.keys(messageValues)
    for (const key of allKeys) {
      const oldMessage = sendObj.get('message') as string
      sendObj.set('message', oldMessage.replaceAll(`\{\{${key}\}\}`, messageValues[key]))
    }
  }

  if (data) sendObj.set('data', data)

  return reply.status(Array.isArray(codeOrMessage) ? codeOrMessage[0] : codeOrMessage in codeMap ? codeMap[codeOrMessage as keyof typeof codeMap][0] : 500).send(Object.fromEntries(sendObj.entries()))
}
