import { app } from '..'
import { userLoginCtrl, userRegisterCtrl } from '../controller.exports'
import { userProfileCtrl } from '../controllers/user/profile'

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

  app.route({
    method: ['GET', 'HEAD'],
    url: '/user/profile',
    logLevel: 'warn',
    ...userProfileCtrl,
  })
}
