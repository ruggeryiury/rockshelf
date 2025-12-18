import { pipeline } from 'node:stream/promises'
import { v4 as uuidv4 } from 'uuid'
import { PythonAPI, STFSFile } from 'rbtools'
import { FilePath, MyObject, parseReadableBytesSize } from 'node-lib'
import { ErrorHandlers, ServerError, serverReply } from '../../core.exports'
import { type ServerErrorHandler, type ServerHandler } from '../../lib.exports'

const handler: ServerHandler = async function (req, reply) {
  const uuid = uuidv4()
  const tempConPath = FilePath.of(`temp/${uuid}.bin`)
  const body = new MyObject<{ title: string }>()

  const parts = req.parts({ limits: { fileSize: parseReadableBytesSize('128MB') } })

  for await (const part of parts) {
    if (part.type === 'file') await pipeline(part.file, await tempConPath.createWriteStream())
    else body.set(part.fieldname, part.value)
  }

  const obj = body.toObject()
  console.log(obj)

  const stfs = new STFSFile(tempConPath)

  return serverReply(reply, 'ok', { stfs })
}

export const songRegister = {
  handler,
  errorHandlers: function (error, req, reply) {
    ErrorHandlers.generic(error, reply)
    ErrorHandlers.unknown(error, reply)
  } as ServerErrorHandler,
} as const
