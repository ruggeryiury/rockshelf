import { AdminRouter } from '../routes/admin'
import { CustomRouter } from '../routes/custom'
import { StatusRouter } from '../routes/status'
import { UserRouter } from '../routes/user'

/**
 * Initialize all routes from the server.
 */
export const initRoutes = () => {
  AdminRouter()
  CustomRouter()
  StatusRouter()
  UserRouter()
}
