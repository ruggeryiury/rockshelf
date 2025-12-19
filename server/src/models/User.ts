import { Document, Model, model, Schema } from 'mongoose'
import bcrypt, { genSalt, hash } from 'bcryptjs'
import { randomByteFromRanges } from 'node-lib'
import { ServerError } from '../core.exports'
import { jwtSign } from '../lib.exports'

export interface UserSchemaInput {
  /**
   * The email address belonging to the user.
   */
  email: string
  /**
   * The username registered by the user.
   */
  username: string
  /**
   * The hashed password of the user.
   */
  password: string
  /**
   * Tells if the user registry is active
   */
  isActive: boolean
  /**
   * Tells if the user has verified its email address
   */
  isEmailVerified: boolean
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
  checkForCaseInsensitivity(): Promise<true>
  /**
   * Signs a token for the user with the `ObjectID` of the user for user requests validation.
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
    password: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: `${randomByteFromRanges(4, ['uppercase'])}-${randomByteFromRanges(4, ['uppercase'])}`,
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
      async checkForCaseInsensitivity() {
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
        return jwtSign({ _id: this.id, admin: this.isAdmin })
      },
    },

    // #region Statics
    statics: {
      async findByCredentials(email: string, password: string) {
        const user = await this.findOne({ email }).select(['+password', '+emailVerified'])
        if (!user) throw new ServerError('err_login_user_notfound', null, { email })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new ServerError('err_login_password_validation')
        if (!user.isActive) throw new ServerError('err_login_user_inactive')
        if (!user.isEmailVerified) throw new ServerError('err_login_user_email_unverified')
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

export const User = model<UserSchemaInput, UserSchemaModel>('User', userSchema)
