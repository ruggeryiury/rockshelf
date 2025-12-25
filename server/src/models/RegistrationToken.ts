import { Document, Model, model, Schema } from 'mongoose'
import { randomByteFromRanges } from 'node-lib'
import { ServerError } from '../core.exports'

export interface RegistrationTokenSchemaInput {
  code: string
  admin: boolean
}

// Methods here
export interface RegistrationTokenSchemaDocument extends RegistrationTokenSchemaInput, Document {
}

// Statics here
export interface RegistrationTokenSchemaModel extends Model<RegistrationTokenSchemaDocument> {
  findByCode(code: string): Promise<RegistrationTokenSchemaDocument>
}

const userSchema = new Schema<RegistrationTokenSchemaInput, RegistrationTokenSchemaModel>(
  {
    code: {
      type: String,
      default: () => `${randomByteFromRanges(3, ['uppercase'])}-${randomByteFromRanges(4, ['uppercase', 'numbers'])}`,
      unique: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    methods: {
    },

    // #region Statics
    statics: {
      async findByCode(code: string) {
        const registry = await this.findOne({ code: code.toUpperCase() })
        if (!registry) throw new ServerError('err_admin_createregistrationtoken_invalidcode', null, { code: code.toUpperCase() })
        return registry
      },
    },
  }
)

export const RegistrationToken = model<RegistrationTokenSchemaInput, RegistrationTokenSchemaModel>('RegistrationToken', userSchema, 'registration_token')
