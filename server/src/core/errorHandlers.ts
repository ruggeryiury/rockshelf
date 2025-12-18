import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ServerError, serverReply } from '../core.exports'
import { isDev } from '../lib.exports'

export class ErrorHandlers {
  /**
   * Detects syntax and content errors on routes that expects a JSON body.
   */
  static json(error: FastifyError, req: FastifyRequest, reply: FastifyReply) {
    if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') return serverReply(reply, 'err_empty_json_body')
    else if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY' || error instanceof SyntaxError) return serverReply(reply, 'err_syntax_json_body')
    if (!req.body) return serverReply(reply, 'err_route_requires_json_body')
  }
  /**
   * Handlers explicit `ServerError` throughout the route handler.
   */
  static generic(error: FastifyError, reply: FastifyReply) {
    if (error instanceof ServerError) return serverReply(reply, error.serverErrorCode, error.data, error.messageValues)
  }

  /**
   * Returns a fallback generic server error reply when no other error conditions are met.
   */
  static unknown(error: FastifyError, reply: FastifyReply) {
    return serverReply(reply, 'err_unknown', isDev() ? { error, debug: ServerError.logErrors(error) } : null)
  }
}
