import { app } from '..'
import { createRegistrationTokenCtrl } from '../controller.exports'

export const AdminRouter = () => {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/admin/createregistrationtoken',
    logLevel: 'warn',
    ...createRegistrationTokenCtrl,
  })
}
