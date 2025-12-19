import { pipeline } from 'node:stream/promises'
import { v4 as uuidv4 } from 'uuid'
import { PythonAPI, STFSFile } from 'rbtools'
import { FilePath, MyObject, parseReadableBytesSize } from 'node-lib'
import { ErrorHandlers, ServerError, response } from '../../core.exports'
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

  return response(reply, { code: 'ok', data: { stfs } })
}

export const songRegister = {
  handler,
  errorHandlers: function (error, req, reply) {
    if (ErrorHandlers.generic(error, reply)) return
    if (ErrorHandlers.unknown(error, reply)) return
  } as ServerErrorHandler,
} as const
