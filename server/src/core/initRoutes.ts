import { SongRouter } from '../routes/song'
import { StatusRouter } from '../routes/status'
import { UserRouter } from '../routes/user'

/**
 * Initialize all routes from the server.
 */
export const initRoutes = () => {
  SongRouter()
  StatusRouter()
  UserRouter()
}
