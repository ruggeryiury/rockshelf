import { app } from '..'
import { songRegister } from '../controller.exports'

export const SongRouter = () => {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/song/register',
    logLevel: 'warn',
    ...songRegister,
  })
}
