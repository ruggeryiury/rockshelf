import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { FilePath } from 'node-lib'

export interface ServerHandlerFnOpts {
  body?: Record<string, any>
  query?: Record<string, any>
  reply?: Record<string, any>
}

export type ServerRequest<T extends ServerHandlerFnOpts = {}> = FastifyRequest<{
  Body: T['body']
  Querystring: T['query']
  Reply: T['reply']
}>

export type ServerReply<T extends ServerHandlerFnOpts = {}> = FastifyReply<{
  Body: T['body']
  Querystring: T['query']
  Reply: T['reply']
}>

export interface ServerHandler<T extends ServerHandlerFnOpts = {}> {
  (this: FastifyInstance, req: ServerRequest<T>, reply: ServerReply<T>): any
}

export interface ServerErrorHandler<T extends ServerHandlerFnOpts = {}> {
  (this: FastifyInstance, error: FastifyError, req: ServerRequest<T>, reply: ServerReply<T>): any
}

export interface ServerAuthHandler<T extends ServerHandlerFnOpts = {}> {
  (this: FastifyInstance, req: ServerRequest<T>, reply: ServerReply<T>, done: (error?: Error) => void): void
}

export interface ServerRequestFileFieldObject {
  filePath: FilePath
  key: string
  fileName: string
  encoding: string
  mimeType: string
}

export type RouteRequest<T> = ServerRequest & T
