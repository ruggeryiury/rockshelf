import { app } from '..'
import { songProjectRegisterCtrl } from '../controller.exports'

export const SongRouter = () => {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/song/register',
    logLevel: 'warn',
    ...songProjectRegisterCtrl,
  })
}
