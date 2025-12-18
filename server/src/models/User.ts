import { Document, Model, model, Schema } from 'mongoose'
import { genSalt, hash } from 'bcryptjs'

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
   * Tells when the user was originally created.
   */
  createdAt: Date
  /**
   * Tells when the user entry was last updated.
   */
  updatedAt: Date
}

// Methods here
export interface UserSchemaDocument extends UserSchemaInput, Document {}

// Statics here
export interface UserSchemaModel extends Model<UserSchemaDocument> {}

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
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await genSalt(12)
    this.password = await hash(this.password, salt)
  }
  this.updatedAt = new Date()
})

export const User = model<UserSchemaInput, UserSchemaModel>('User', userSchema)
