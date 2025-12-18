import { type FastifyError, type FastifyRequest } from 'fastify'
import type { LiteralUnion } from 'type-fest'
import { MongoError } from 'mongodb'
import { TokenError } from 'fast-jwt'
import { ZodError } from 'zod'
import { MongooseError } from 'mongoose'
import { codeMap } from '../core.exports'

export interface ServerErrorLogObject {
  /**
   * Tells if the error is an instance of the generic `Error` class from NodeJS.
   */
  isError: boolean
  /**
   * Tells if the error is an instance of `ServerError` (custom error class used on this server).
   */
  isServerError: boolean
  /**
   * Tells if the error is an instance of `EvalError`.
   */
  isEvalError: boolean
  /**
   * Tells if the error is an instance of `TypeError`.
   */
  isTypeError: boolean
  /**
   * Tells if the error is an instance of `RangeError`.
   */
  isRangeError: boolean
  /**
   * Tells if the error is an instance of `SyntaxError`.
   */
  isSyntaxError: boolean
  /**
   * Tells if the error is an instance of `MongoError` (imported from `mongodb`).
   */
  isMongoError: boolean
  /**
   * Tells if the error is an instance of `TokenError` (imported from `fast-jwt`).
   */
  isTokenError: boolean
  /**
   * Tells if the error is an instance of `TokenError` (imported from `mongoose`).
   */
  isMongooseError: boolean
  /**
   * Tells if the error is an instance of `ZodError` (imported from `zod`).
   */
  isZodError: boolean
}

// #region Enums

export const httpCodes = {
  // 1xx: Informational
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',

  // 2xx: Success
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',

  // 3xx: Redirection
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',

  // 4xx: Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a Teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // 5xx: Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
} as const

export type ReplyCodeNames = keyof typeof codeMap
export type HTTPCodes = keyof typeof httpCodes
export type HTTPCodeNames = (typeof httpCodes)[HTTPCodes]
export type DirectMessage = [HTTPCodes, string]

export class ServerError extends Error {
  /**
   * A code of the error (status code and message will be retrieved from the internal code map), or an array with the status code and the custom message.
   */
  serverErrorCode: LiteralUnion<ReplyCodeNames, string> | DirectMessage
  /**
   * Values that will be placed on the server response body to the client.
   */
  data?: Record<string, any> | null
  /**
   * An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
   */
  messageValues?: Record<string, string>

  /**
   * Builds and throws stardardized error objects throughout the server routes.
   * - - - -
   * @param {LiteralUnion<ReplyCodeNames, string> | DirectMessage} codeOrMessage A code of the error (status code and message will be retrieved from the internal code map), or an array with the status code and the custom message.
   * @param {Record<string, any> | null} [data] `OPTIONAL` Values that will be placed on the reply JSON object.
   * @param {Record<string, string>} [messageValues] `OPTIONAL` An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
   */
  constructor(codeOrMessage: LiteralUnion<ReplyCodeNames, string> | DirectMessage, data?: Record<string, any> | null, messageValues?: Record<string, string>) {
    super('')
    this.serverErrorCode = codeOrMessage
    this.data = data
    this.messageValues = messageValues
    this.message = 'An unknown error occurred, please try again later'

    if (Array.isArray(codeOrMessage)) this.message = codeOrMessage[1]
    else if (codeMap[codeOrMessage as ReplyCodeNames]) this.message = codeMap[codeOrMessage as ReplyCodeNames][1]

    if (messageValues) {
      const allKeys = Object.keys(messageValues)
      for (const key of allKeys) {
        this.message = this.message.replaceAll(`\{\{${key}\}\}`, messageValues[key])
      }
    }
  }

  /**
   * A function that helps identifying the classes behind errors on a route error handler function, returning an object with commam checked error instances.
   * - - - -
   * @param {FastifyError} error The fastify instance of the error.
   * @param {FastifyRequest} [req] `OPTIONAL` By giving the fastify request instance, it automatically logs the error on the console.
   * @returns {ServerErrorLogObject}
   */
  static logErrors(error: FastifyError, req?: FastifyRequest): ServerErrorLogObject {
    const isError = error instanceof Error
    const isServerError = error instanceof ServerError
    const isEvalError = error instanceof EvalError
    const isTypeError = error instanceof TypeError
    const isRangeError = error instanceof RangeError
    const isSyntaxError = error instanceof SyntaxError

    // mongodb
    const isMongoError = error instanceof MongoError

    // fast-jwt
    const isTokenError = error instanceof TokenError

    // mongoose
    const isMongooseError = error instanceof MongooseError

    // zod
    const isZodError = error instanceof ZodError

    const output = {
      isError,
      isServerError,
      isEvalError,
      isTypeError,
      isRangeError,
      isSyntaxError,
      isMongoError,
      isTokenError,
      isMongooseError,
      isZodError,
    }
    if (req) req.log.error(output, 'An error occurred')
    return output
  }
}
