import { DirPath } from 'node-lib'

export const loggerConfig = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'HH:MM:ss',
    },
  },
} as const

export const rootPath = new DirPath(import.meta.dirname)
