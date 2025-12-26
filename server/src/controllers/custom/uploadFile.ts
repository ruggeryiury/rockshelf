import { decodeAuthBearerToken, type ServerHandler } from '../../lib.exports'
import { response, ServerError } from '../../core.exports'
import { customUploadFileErrorHandler } from './uploadFile.error'
import { v4 as genUUIDv4 } from 'uuid'
import { rootPath } from '../../config'
import { getReadableBytesSize, parseReadableBytesSize } from 'node-lib'
import { User } from '../../models/User'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { DTAParser, PythonAPI, STFSFile } from 'rbtools'

export interface CustomUploadFile {
  body: undefined
}

const handler: ServerHandler<CustomUploadFile> = async function (req, reply) {
  const decToken = decodeAuthBearerToken(req.headers.authorization)
  const user = await User.findByDecodedToken(decToken)
  const uuid = genUUIDv4()
  const tempCONPath = rootPath.gotoFile(`../temp/${uuid}`)
  const parts = req.files({ limits: { fileSize: parseReadableBytesSize('96MB'), parts: 1 } })

  let i = 0
  for await (const part of parts) {
    if (part.file) await pipeline(part.file, createWriteStream(tempCONPath.path))
    i++
  }
  if (i === 0) throw new ServerError([400, 'Missing CON file'])

  const con = new STFSFile(tempCONPath)
  await con.checkFileIntegrity()
  const { desc, dta, fileSize, files, isPack, name } = await con.stat()

  return response(reply, {
    code: 'ok',
    data: {
      token: uuid,
      stat: {
        name,
        desc,
        isPack,
        files,
        fileSize,
        dta: dta.songs,
      },
    },
  })
}

export const customUploadFileCtrl = {
  handler,
  errorHandler: customUploadFileErrorHandler,
} as const
