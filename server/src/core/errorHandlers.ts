import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ServerError, response } from '../core.exports'
import { isDev } from '../lib.exports'
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
    output.set('isTokenError', error instanceof TokenError)
    output.set('isMongooseError', error instanceof MongooseError)
    output.set('isZodError', error instanceof ZodError)

    return output.toObject()
  }
  /**
   * Detects syntax and content errors on routes that expects a JSON body.
   */
  static json(error: FastifyError, req: FastifyRequest, reply: FastifyReply) {
    if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') {
      response(reply, { code: 'err_empty_json_body' })
      return true
    } else if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || error instanceof SyntaxError) {
      response(reply, { code: 'err_syntax_json_body' })
      return true
    }
    if (!req.body) {
      response(reply, { code: 'err_route_requires_json_body' })
      return true
    }
  }
  /**
   * Handlers explicit `ServerError` throughout the route handler.
   */
  static generic(error: FastifyError, reply: FastifyReply) {
    if (error instanceof ServerError) {
      response(reply, { code: error.serverErrorCode, data: error.data, messageValues: error.messageValues })
      return true
    }
  }

  /**
   * Returns a fallback generic server error reply when no other error conditions are met.
   */
  static unknown(error: FastifyError, reply: FastifyReply) {
    response(reply, { code: 'err_unknown', data: error })
    return true
  }
}
