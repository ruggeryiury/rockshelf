import { app } from '..'
import { userLoginCtrl, userRegisterCtrl } from '../controller.exports'

export const UserRouter = () => {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/register',
    logLevel: 'warn',
    ...userRegisterCtrl,
  })

  app.route({
    method: ['POST', 'HEAD'],
    url: '/user/login',
    logLevel: 'warn',
    ...userLoginCtrl,
  })
}
