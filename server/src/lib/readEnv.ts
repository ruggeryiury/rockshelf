import zod from 'zod'

export interface EnvironmentObj {
  /**
   * The port number on which the server will listen.
   *
   * This value is derived from the `PORT` environment variable
   * and defaults to `5000` if not explicitly provided.
   */
  port: number

  /**
   * The MongoDB connection URI.
   *
   * This value is read from the `MONGODB_URI` environment variable
   * and is validated to be a properly formatted URL.
   */
  mongoDBURI: string
  /**
   * Secret key used to sign and verify JSON Web Tokens (JWT).
   *
   * This value must be provided via the `JWT_SECRET` environment variable
   * and should be kept private and secure.
   */
  jwtSecret: string
}

/**
 * Reads, validates, and returns required environment variables for the application.
 *
 * This function performs runtime validation on critical configuration values:
 * - Ensures the server port is a valid number
 * - Ensures a MongoDB connection URI is present and valid
 * - Ensures a JWT secret is provided
 *
 * If any required environment variable is missing or invalid,
 * an error is thrown to prevent the application from starting
 * with an invalid configuration.
 *
 * @throws {TypeError} If `PORT` is provided but is not a valid number.
 * @throws {Error} If `MONGODB_URI` is missing or not a valid URL.
 * @throws {Error} If `JWT_SECRET` is missing.
 * @returns {EnvironmentObj} An object containing the validated environment configuration.
 *
 * @example
 * const env = readEnv()
 * console.log(env.port)        // number
 * console.log(env.mongoDBURI)  // string
 * console.log(env.jwtSecret)   // string
 */
export const readEnv = (): EnvironmentObj => {
  const port = Number(process.env.PORT || '5000')
  if (isNaN(port)) throw new TypeError(`Invalid server port number provided as environmente variable.`)

  const mongoDBURI = process.env.MONGODB_URI
  if (!mongoDBURI) throw new Error('No MongoDB URI provided as environmente variable.')
  if (zod.url().safeParse(mongoDBURI).error) throw new Error('Provided MongoDB URI value is not valid.')

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) throw new Error('No JWT secret provided as environmente variable.')

  return {
    port,
    mongoDBURI,
    jwtSecret,
  }
}
