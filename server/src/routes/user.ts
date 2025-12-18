import { app } from '..'
import { userRegisterCtrl } from '../controller.exports'

export const UserRouter = () => {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/register',
    logLevel: 'warn',
    ...userRegisterCtrl,
  })
}
