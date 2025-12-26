import { app } from '..'
import { customUploadFileCtrl } from '../controllers/custom/uploadFile'

export const CustomRouter = () => {
  app.route({
    method: ['POST', 'HEAD'],
    url: '/custom/upload_file',
    logLevel: 'warn',
    ...customUploadFileCtrl,
  })
}
