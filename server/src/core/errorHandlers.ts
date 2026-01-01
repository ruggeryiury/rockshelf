import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ServerError, response } from '../core.exports'
import { TokenError } from 'fast-jwt'
import { MongoError } from 'mongodb'
import { MongooseError } from 'mongoose'
import { ZodError } from 'zod'
import { MyObject } from 'node-lib'

export interface ErrorDiagnosticObject {
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

export class ErrorHandlers {
  static tokenErrorCodes = ['FAST_JWT_INVALID_TYPE', 'FAST_JWT_INVALID_OPTION', 'FAST_JWT_INVALID_ALGORITHM', 'FAST_JWT_INVALID_CLAIM_TYPE', 'FAST_JWT_INVALID_CLAIM_VALUE', 'FAST_JWT_INVALID_KEY', 'FAST_JWT_INVALID_SIGNATURE', 'FAST_JWT_INVALID_PAYLOAD', 'FAST_JWT_MALFORMED', 'FAST_JWT_INACTIVE', 'FAST_JWT_EXPIRED', 'FAST_JWT_MISSING_KEY', 'FAST_JWT_KEY_FETCHING_ERROR', 'FAST_JWT_SIGN_ERROR', 'FAST_JWT_VERIFY_ERROR', 'FAST_JWT_MISSING_REQUIRED_CLAIM', 'FAST_JWT_MISSING_SIGNATURE'] as const
  /**
   * A function that helps identifying the class instances behind errors on a route error handler function.
   * - - - -
   * @param {FastifyError} error The fastify instance of the error.
   * @returns {ErrorDiagnosticObject}
   */
  static diagnoseErrors(error: FastifyError): ErrorDiagnosticObject {
    const output = new MyObject<ErrorDiagnosticObject>()
    output.set('isError', error instanceof Error)
    output.set('isServerError', error instanceof ServerError)
    output.set('isEvalError', error instanceof EvalError)
    output.set('isTypeError', error instanceof TypeError)
    output.set('isRangeError', error instanceof RangeError)
    output.set('isSyntaxError', error instanceof SyntaxError)
    output.set('isMongoError', error instanceof MongoError)
    output.set('isTokenError', this.tokenErrorCodes.includes(error.code as (typeof this.tokenErrorCodes)[number]))
    output.set('isMongooseError', error instanceof MongooseError)
    output.set('isZodError', error instanceof ZodError)

    return output.toObject()
  }
  /**
   * Detects syntax and content errors on routes that expects a JSON body.
   */
  static json(error: FastifyError, req: FastifyRequest, reply: FastifyReply): FastifyReply | undefined {
    if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') return response(reply, { code: 'err_empty_json_body' })
    else if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || error instanceof SyntaxError) return response(reply, { code: 'err_syntax_json_body' })
    if (!req.body) return response(reply, { code: 'err_route_requires_json_body' })
  }
  /**
   * Handlers explicit `ServerError` throughout the route handler.
   */
  static generic(error: FastifyError, reply: FastifyReply): FastifyReply | undefined {
    if (error instanceof ServerError) return response(reply, { code: error.serverErrorCode, data: error.data, messageValues: error.messageValues })
  }

  static bearerToken(error: FastifyError, reply: FastifyReply): FastifyReply | undefined {
    if (ErrorHandlers.tokenErrorCodes.includes(error.code as (typeof this.tokenErrorCodes)[number])) {
      if (error.code === 'FAST_JWT_EXPIRED') return response(reply, { code: 'err_user_token_expired' })
    }
    return
  }

  /**
   * Returns a fallback generic server error reply when no other error conditions are met.
   */
  static unknown(error: FastifyError, reply: FastifyReply): FastifyReply {
    return response(reply, { code: 'err_unknown', data: error })
  }
}
