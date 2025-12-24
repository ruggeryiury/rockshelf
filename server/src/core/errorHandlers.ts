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

  /**
   * Returns a fallback generic server error reply when no other error conditions are met.
   */
  static unknown(error: FastifyError, reply: FastifyReply): FastifyReply {
    return response(reply, { code: 'err_unknown', data: error })
  }

  /**
   * Route-specific error handlers
   */
  static route = {
    // #region user/login

    userLogin: (error, _, reply) => {
      if (error instanceof ZodError) {
        const issue = error.issues[0]
        if (issue.code === 'invalid_type') {
          // Empty body
          if (issue.message === 'Invalid input: expected object, received undefined' && issue.path.length === 0) return response(reply, { code: 'err_user_register_no_body' })
          // No email
          if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_no_email' })
          // No password
          if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'password') return response(reply, { code: 'err_user_register_no_password' })
        }
        if (issue.code === 'too_small') {
          // Too small username
          if (issue.path[0] === 'username') return response(reply, { code: 'err_user_register_username_toosmall' })
          // Too small password
          if (issue.path[0] === 'password') return response(reply, { code: 'err_user_register_password_toosmall' })
        }
        if (issue.code === 'too_big') {
          // Too big username
          if (issue.path[0] === 'username') return response(reply, { code: 'err_user_register_username_toobig' })
          // Too big password
          if (issue.path[0] === 'password') return response(reply, { code: 'err_user_register_password_toobig' })
        }

        // Bad e-mail format
        if (issue.code === 'invalid_format' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_email_invalid' })

        // Any custom
        if (issue.code === 'custom') return response(reply, { code: issue.message })
      }
    },

    // #region user/register

    userRegister: (error, _, reply) => {
      if (error instanceof ZodError) {
        const issue = error.issues[0]
        if (issue.code === 'invalid_type') {
          // Empty body
          if (issue.message === 'Invalid input: expected object, received undefined' && issue.path.length === 0) return response(reply, { code: 'err_user_register_no_body' })
          // No email
          if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_no_email' })
          // No username
          if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'username') return response(reply, { code: 'err_user_register_no_username' })
          // No password
          if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'password') return response(reply, { code: 'err_user_register_no_password' })
        }
        if (issue.code === 'too_small') {
          // Too small username
          if (issue.path[0] === 'username') return response(reply, { code: 'err_user_register_username_toosmall' })
          // Too small password
          if (issue.path[0] === 'password') return response(reply, { code: 'err_user_register_password_toosmall' })
        }
        if (issue.code === 'too_big') {
          // Too big username
          if (issue.path[0] === 'username') return response(reply, { code: 'err_user_register_username_toobig' })
          // Too big password
          if (issue.path[0] === 'password') return response(reply, { code: 'err_user_register_password_toobig' })
        }

        // Bad e-mail format
        if (issue.code === 'invalid_format' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_email_invalid' })

        // Password validation
        if (issue.code === 'invalid_format' && issue.path[0] === 'password') {
          if (issue.pattern === '/[a-z]/') return response(reply, { code: 'err_user_register_password_nolowercase' })
          if (issue.pattern === '/[A-Z]/') return response(reply, { code: 'err_user_register_password_nouppercase' })
          if (issue.pattern === '/[0-9]/') return response(reply, { code: 'err_user_register_password_nonumber' })
          if (issue.pattern === '/[^A-Za-z0-9]/') return response(reply, { code: 'err_user_register_password_nospecialchar' })
        }

        if (issue.code === 'custom') return response(reply, { code: issue.message })
      }

      // Duplicated e-mail
      if (error instanceof MongoError && Number(error.code) === 11000 && 'keyValue' in error && error.keyValue !== null && error.keyValue !== undefined && 'email' in (error.keyValue as Record<string, string>)) {
        const email = (error.keyValue as Record<string, string>).email

        return response(reply, { code: 'err_user_register_duplicated_email', messageValues: { email } })
      }

      // Duplicated username
      if (error instanceof MongoError && Number(error.code) === 11000 && 'keyValue' in error && error.keyValue !== null && error.keyValue !== undefined && 'username' in (error.keyValue as Record<string, string>)) {
        const username = (error.keyValue as Record<string, string>).username

        return response(reply, { code: 'err_user_register_duplicated_username', messageValues: { username } })
      }
    },
  } as Record<string, (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => FastifyReply | undefined>
}
