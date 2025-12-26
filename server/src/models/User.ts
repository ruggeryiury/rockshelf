import { Document, Model, model, Schema } from 'mongoose'
import bcrypt, { genSalt, hash } from 'bcryptjs'
import { randomByteFromRanges } from 'node-lib'
import { ServerError } from '../core.exports'
import { jwtSign, jwtVerify, type BearerDecodedTokenObject } from '../lib.exports'

export interface UserSchemaInput {
  /**
   * The email address belonging to the user.
   */
  email: string
  /**
   * The username registered by the user, used on URLs.
   */
  username: string
  /**
   * The name displayed of the user's profile.
   */
  profileName: string
  /**
   * The hashed password of the user.
   */
  password: string
  /**
   * Tells if the user registry is active
   */
  isActive: boolean
  /**
   * Tells if the user registered has admin privileges
   */
  isAdmin: boolean
  /**
   * The code which can verify your account. It's generated automatically on each new registry.
   */
  emailVerificationCode: string
  /**
   * Tells when the user was originally created.
   */
  createdAt: Date
  /**
   * Tells when the user entry was last updated.
   */
  updatedAt: Date
}

// Methods here
export interface UserSchemaDocument extends UserSchemaInput, Document {
  /**
   * Performs a case-insensitive e-mail and username validation for new user registry.
   * - - - -
   */
  checkRegistryCaseInsensitive(): Promise<true>
  /**
   * Returns a signed token in Base64 encoding for user requests validation.
   * - - - -
   */
  generateToken(): Promise<string>
}

// Statics here
export interface UserSchemaModel extends Model<UserSchemaDocument> {
  /**
   * Finds a `User` registry by checking basic credentials.
   * - - - -
   * @param {string} email The user e-mail address.
   * @param {string} password The user password.
   * @returns {Promise<UserSchemaDocument>}
   * @throws {ServerError} When no user is found using the provided e-mail, or when the provided password doesn't match.
   */
  findByCredentials(email: string, password: string): Promise<UserSchemaDocument>
  /**
   * Finds a `User` registry by it's decoded token.
   * - - - -
   * @param {BearerDecodedTokenObject} token The user decode token.
   * @returns {Promise<UserSchemaDocument>}
   */
  findByDecodedToken(token: BearerDecodedTokenObject): Promise<UserSchemaDocument>
}

const userSchema = new Schema<UserSchemaInput, UserSchemaModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    profileName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    methods: {
      async checkRegistryCaseInsensitive() {
        const users = User.find().select({ username: 1, email: 1 })
        let invalid: boolean | 'username' | 'email' = false
        for await (const user of users) {
          if (user.username.toLowerCase() === this.username.toLowerCase()) {
            invalid = 'username'
            break
          } else if (user.email.toLowerCase() === this.email.toLowerCase()) {
            invalid = 'email'
            break
          }
        }

        if (invalid === 'username') throw new ServerError('err_user_register_duplicated_username', null, { username: this.username })
        else if (invalid === 'email') throw new ServerError('err_user_register_duplicated_email', null, { email: this.email })
      },
      async generateToken() {
        return Buffer.from(jwtSign({ _id: this.id, isAdmin: this.isAdmin })).toString('base64')
      },
    },

    // #region Statics
    statics: {
      async findByCredentials(email: string, password: string) {
        const user = await this.findOne({ email }).select(['+password'])
        if (!user) throw new ServerError('err_login_user_notfound', null, { email })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new ServerError('err_login_password_validation')
        if (!user.isActive) throw new ServerError('err_login_user_inactive')
        return user
      },
      async findByDecodedToken(token: BearerDecodedTokenObject) {
        const user = await this.findOne({ _id: token._id }).select({})
        if (!user) throw new ServerError('err_invalid_auth')
        if (!user.isActive) throw new ServerError('err_login_user_inactive')
        return user
      },
    },
  }
)

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await genSalt(12)
    this.password = await hash(this.password, salt)
  }
  this.updatedAt = new Date()
})

export const User = model<UserSchemaInput, UserSchemaModel>('User', userSchema, 'users')
