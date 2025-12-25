import { AdminRouter } from '../routes/admin'
import { StatusRouter } from '../routes/status'
import { UserRouter } from '../routes/user'

/**
 * Initialize all routes from the server.
 */
export const initRoutes = () => {
  AdminRouter()
  StatusRouter()
  UserRouter()
}
