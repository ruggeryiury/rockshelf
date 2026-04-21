import { BinaryWriter } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import type { RequiredDeep } from 'type-fest'
import { dtaRenderArray, dtaRenderBoolean, dtaRenderComment, dtaRenderFloat, dtaRenderIfDef, dtaRenderNumber, dtaRenderObject, dtaRenderString, dtaRenderVariable } from '../../lib.exports'

export type DTADocumentInlineTypes = boolean | 'expanded'

// #region Interfaces
export interface StringFormattingOptions {
  /**
   * Default is `true`.
   */
  apostropheOnKey?: boolean
  /**
   * Default is `expanded`.
   */
  keyAndValueInline?: DTADocumentInlineTypes
}

export interface StringVariableFormattingOptions {
  /**
   * Default is `true`.
   */
  apostropheOnKey?: boolean
  /**
   * Default is `true`.
   */
  apostropheOnVariable?: boolean
  /**
   * Default is `true`.
   */
  keyAndValueInline?: DTADocumentInlineTypes
}

export interface NumberAndFloatFormattingOptions {
  /**
   * Default is `true`.
   */
  apostropheOnKey?: boolean
  /**
   * Default is `2`.
   */
  floatMaxDecimals?: number
}

export interface BooleanFormattingOptions {
  /**
   * Default is `true`.
   */
  apostropheOnKey?: boolean
  /**
   * Default is `number`.
   */
  type?: 'verbosed' | 'number'
}

export interface ObjectFormattingOptions {
  /**
   * Default is `true`.
   */
  apostropheOnKey?: boolean
  /**
   * Default is `false`.
   */
  keyAndValueInline?: DTADocumentInlineTypes
  /**
   * Default is `false`.
   */
  closeParenthesisInline?: boolean
}

export interface ArrayFormattingOptions {
  /**
   * Default is `true`.
   */
  apostropheOnKey?: boolean
  /**
   * Default is `true`.
   */
  keyAndValueInline?: DTADocumentInlineTypes
  /**
   * Default is `true`.
   */
  valuesInline?: DTADocumentInlineTypes
  /**
   * Default is `true`.
   */
  parenthesisForValues?: boolean
  /**
   * Default is `false`.
   */
  openParenthesisInline?: boolean
  /**
   * Default is `false`.
   */
  closeParenthesisInline?: boolean
}

export interface DTADocumentFormattionOptions {
  /**
   * Default is `3`.
   */
  useSpaces: number | false
}

export type DTAFormattingTypes = 'string' | 'str_var' | 'number' | 'float' | 'boolean' | 'object' | 'array'

export interface StringValueObject {
  /**
   * The type of the value.
   */
  __type: 'string'
  /**
   * The value itself.
   */
  __value: string
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: Required<StringFormattingOptions>
}

export interface StringVariableValueObject {
  /**
   * The type of the value.
   */
  __type: 'str_var'
  /**
   * The value itself.
   */
  __value: string
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: Required<StringVariableFormattingOptions>
}

export interface NumberValueObject {
  /**
   * The type of the value.
   */
  __type: 'number'
  /**
   * The value itself.
   */
  __value: number
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: Required<NumberAndFloatFormattingOptions>
}

export interface FloatValueObject {
  /**
   * The type of the value.
   */
  __type: 'float'
  /**
   * The value itself.
   */
  __value: number
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: Required<NumberAndFloatFormattingOptions>
}

export interface BooleanValueObject {
  /**
   * The type of the value.
   */
  __type: 'boolean'
  /**
   * The value itself.
   */
  __value: boolean
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: Required<BooleanFormattingOptions>
}

export interface ObjectValueObject {
  /**
   * The type of the value.
   */
  __type: 'object'
  /**
   * The value itself.
   */
  __value: Record<string, any>
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: RequiredDeep<DTAIOFormattingOptions>
}

export interface ArrayValueObject {
  /**
   * The type of the value.
   */
  __type: 'array'
  /**
   * The value itself.
   */
  __value: DTAIOAddValueTypes[]
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: RequiredDeep<DTAIOFormattingOptions>
}

export interface UndefinedValueObject {
  /**
   * The type of the value.
   */
  __type: 'undefined'
  /**
   * The value itself.
   */
  __value: string
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: RequiredDeep<DTAIOFormattingOptions>
}

export interface CommentValueObject {
  /**
   * The type of the value.
   */
  __type: 'comment'
  /**
   * The value itself.
   */
  __value: string
}

export interface IfDefValueObject {
  /**
   * The type of the value.
   */
  __type: 'ifdef'
  /**
   * The condition where the IF ELSE will be evaluated.
   */
  __condition: string
  /**
   * The value you want place if the condition is `true`.
   */
  __valueIfTrue: string
  /**
   * The value you want place if the condition is `false`.
   */
  __valueIfFalse: string
  /**
   * An object that might override the options for specific rendering of this specific value.
   */
  __options: RequiredDeep<DTAIOFormattingOptions>
}

export interface DTAIOFormattingOptions {
  /**
   * An object that changes the behavior of string values rendering.
   */
  string?: StringFormattingOptions
  /**
   * An object that changes the behavior of string variable values rendering.
   */
  variable?: StringVariableFormattingOptions
  /**
   * An object that changes the behavior of number values rendering.
   */
  number?: NumberAndFloatFormattingOptions
  /**
   * An object that changes the behavior of boolean values rendering.
   */
  boolean?: BooleanFormattingOptions
  /**
   * An object that changes the behavior of object values rendering.
   */
  object?: ObjectFormattingOptions
  /**
   * An object that changes the behavior of array values rendering.
   */
  array?: ArrayFormattingOptions
  /**
   * An object with properties that modifies the default behavior of the DTA script rendering.
   */
  dta?: DTADocumentFormattionOptions
}

export type ValueObjectsTypes = StringValueObject | StringVariableValueObject | NumberValueObject | FloatValueObject | BooleanValueObject | ObjectValueObject | ArrayValueObject | UndefinedValueObject | CommentValueObject | IfDefValueObject

export type DTAIOAddValueTypes = string | number | boolean | Record<string, any> | DTAIOAddValueTypes[] | ValueObjectsTypes | null | undefined

/**
 * A class that renders a DTA file content from JSON objects.
 * - - - -
 */
export class DTAIO {
  // #region Class properties

  /**
   * An object with all added values to be rendered.
   *
   * You can add values using the class `addValue()` method.
   */
  private content: Record<string, any>
  /**
   * An object with values that manipulates the rendering of the DTA file.
   */
  options: RequiredDeep<DTAIOFormattingOptions>

  // #region Format Options

  static readonly formatOptions = {
    /**
     * The default format options used on MAGMA generated contents.
     */
    defaultMAGMA: {
      string: {
        apostropheOnKey: true,
        keyAndValueInline: 'expanded',
      },
      variable: {
        apostropheOnKey: true,
        apostropheOnVariable: true,
        keyAndValueInline: true,
      },
      number: {
        apostropheOnKey: true,
        floatMaxDecimals: 2,
      },
      boolean: {
        apostropheOnKey: true,
        type: 'number',
      },
      object: {
        apostropheOnKey: true,
        keyAndValueInline: 'expanded',
        closeParenthesisInline: false,
      },
      array: {
        apostropheOnKey: true,
        keyAndValueInline: 'expanded',
        valuesInline: true,
        parenthesisForValues: true,
        openParenthesisInline: true,
        closeParenthesisInline: true,
      },
      dta: {
        useSpaces: 3,
      },
    } as RequiredDeep<DTAIOFormattingOptions>,
    defaultRB3: {
      string: {
        apostropheOnKey: false,
        keyAndValueInline: true,
      },
      variable: {
        apostropheOnKey: false,
        apostropheOnVariable: false,
        keyAndValueInline: true,
      },
      number: {
        apostropheOnKey: false,
        floatMaxDecimals: 1,
      },
      boolean: {
        apostropheOnKey: false,
        type: 'verbosed',
      },
      object: {
        apostropheOnKey: false,
        keyAndValueInline: false,
        closeParenthesisInline: false,
      },
      array: {
        apostropheOnKey: false,
        keyAndValueInline: true,
        valuesInline: true,
        parenthesisForValues: true,
        openParenthesisInline: true,
        closeParenthesisInline: true,
      },
      dta: {
        useSpaces: false,
      },
    } as RequiredDeep<DTAIOFormattingOptions>,
  }

  // #region Constructor

  /**
   * @param {DTAIOFormattingOptions | undefined} formatOptions `OPTIONAL` An object with values that manipulates the rendering of the DTA file contents.
   */
  constructor(formatOptions?: DTAIOFormattingOptions) {
    this.content = {}
    this.options = useDefaultOptions<RequiredDeep<DTAIOFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA, formatOptions as RequiredDeep<DTAIOFormattingOptions>)
  }

  // #region Static Methods

  /**
   * Checks if given value for rendering is a `ValueObject` object.
   * - - - -
   * @param {DTAIOAddValueTypes} obj The object you want to check the type.
   * @returns {boolean}
   */
  static isValueObject(obj: DTAIOAddValueTypes): obj is ValueObjectsTypes {
    return obj !== null && typeof obj === 'object' && '__type' in obj
  }

  static valueToObject(value: DTAIOAddValueTypes, formatOptions?: RequiredDeep<DTAIOFormattingOptions>): ValueObjectsTypes {
    const options = useDefaultOptions<RequiredDeep<DTAIOFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA, formatOptions)
    if (DTAIO.isValueObject(value)) return value
    else {
      if (typeof value === 'undefined') return DTAIO.useUndefined()
      else if (typeof value === 'object') {
        if (Array.isArray(value)) return DTAIO.useArray(value, options)
        else if (value === null) return DTAIO.useNull()
        return DTAIO.useObject(value, options)
      } else if (typeof value === 'string') {
        if ((value.startsWith('@{string("') && value.endsWith('")}')) || (value.startsWith("@{string('") && value.endsWith("')}"))) return DTAIO.useString(value.slice(10, -3))
        else if ((value.startsWith('@{str_var("') && value.endsWith('")}')) || (value.startsWith("@{str_var('") && value.endsWith("')}"))) return DTAIO.useVariable(value.slice(11, -3), options.number)
        else if ((value.startsWith('@{var("') && value.endsWith('")}')) || (value.startsWith("@{var('") && value.endsWith("')}"))) return DTAIO.useVariable(value.slice(7, -3), options.number)
        else if (value.startsWith('@{float(') && value.endsWith(')}')) return DTAIO.useFloat(Number(value.slice(8, -2)), options.number)
        else if (value.startsWith('@{boolean(') && value.endsWith(')}')) {
          const condition = value.slice(10, -2).toLowerCase() === 'true' || value.slice(10, -2) === '1'
          return DTAIO.useBoolean(condition, options.boolean)
        }

        const isFirstCharSpecial = !/^[a-z0-9]/.test(value)
        const isValueANumber = !isNaN(Number(value))
        const isVarType = value.split(' ').length === 1 && value.toLowerCase() === value && !isValueANumber && !isFirstCharSpecial

        if (isVarType) return this.useVariable(value, options.variable)
        return this.useString(value, options.string)
      } else if (typeof value === 'number') {
        const isInteger = Number.isInteger(value)
        if (isInteger) return this.useNumber(value, options.number)
        else return this.useFloat(value, options.number)
      } else if (typeof value === 'boolean') return this.useBoolean(value, options.boolean)
      return DTAIO.useNull({ apostropheOnVariable: false })
    }
  }

  // #region Mixed Methods

  /**
   * Transforms a `string` type value to `StringValueObject`.
   * - - - -
   * @param {string} value The value you want to transform.
   * @param {StringFormattingOptions | undefined} formatOptions `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {StringValueObject}
   */
  static useString = (value: string, formatOptions?: StringFormattingOptions): StringValueObject => ({
    __type: 'string',
    __value: value,
    __options: useDefaultOptions<Required<StringFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA.string, formatOptions),
  })

  /**
   * Transforms a `variable` type value to `StringVariableValueObject`.
   * - - - -
   * @param {string} value The value you want to transform.
   * @param {StringVariableFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {StringVariableValueObject}
   */
  static useVariable = (value: string, formatOptions?: StringVariableFormattingOptions): StringVariableValueObject => ({
    __type: 'str_var',
    __value: value,
    __options: useDefaultOptions<Required<StringVariableFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA.variable, formatOptions),
  })

  /**
   * Transforms a `variable` type value to `NumberValueObject`.
   * - - - -
   * @param {number} value The value you want to transform.
   * @param {NumberAndFloatFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {NumberValueObject}
   */
  static useNumber = (value: number, formatOptions?: NumberAndFloatFormattingOptions): NumberValueObject => ({
    __type: 'number',
    __value: value,
    __options: useDefaultOptions<Required<NumberAndFloatFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA.number, formatOptions),
  })

  /**
   * Transforms a `variable` type value to `FloatValueObject`.
   * - - - -
   * @param {number} value The value you want to transform.
   * @param {NumberAndFloatFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {FloatValueObject}
   */
  static useFloat = (value: number, formatOptions?: NumberAndFloatFormattingOptions): FloatValueObject => ({
    __type: 'float',
    __value: value,
    __options: useDefaultOptions<Required<NumberAndFloatFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA.number, formatOptions),
  })

  /**
   * Transforms a `variable` type value to `BooleanValueObject`.
   * - - - -
   * @param {boolean} value The value you want to transform.
   * @param {BooleanFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {BooleanValueObject}
   */
  static useBoolean = (value: boolean, formatOptions?: BooleanFormattingOptions): BooleanValueObject => ({
    __type: 'boolean',
    __value: value,
    __options: useDefaultOptions<Required<BooleanFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA.boolean, formatOptions),
  })

  /**
   * Transforms a `variable` type value to `StringVariableValueObject`.
   * - - - -
   * @param {StringVariableFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {StringVariableValueObject}
   */
  static useNull = (formatOptions?: StringVariableFormattingOptions): StringVariableValueObject => ({
    __type: 'str_var',
    __value: 'null',
    __options: useDefaultOptions<Required<StringVariableFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA.variable, formatOptions),
  })

  /**
   * Transforms a `variable` type value to `ObjectValueObject`.
   * - - - -
   * @param {Record<string, unknown>} value The value you want to transform.
   * @param {DTAIOFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {ObjectValueObject}
   */
  static useObject = (value: Record<string, unknown>, formatOptions?: DTAIOFormattingOptions): ObjectValueObject => ({
    __type: 'object',
    __value: value,
    __options: useDefaultOptions<RequiredDeep<DTAIOFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA, formatOptions as RequiredDeep<DTAIOFormattingOptions>),
  })

  /**
   * Transforms a `variable` type value to `ArrayValueObject`.
   * - - - -
   * @param {DTAIOAddValueTypes[]} value The value you want to transform.
   * @param {DTAIOFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * @returns {ArrayValueObject}
   */
  static useArray = (value: DTAIOAddValueTypes[], formatOptions?: DTAIOFormattingOptions): ArrayValueObject => ({
    __type: 'array',
    __value: value,
    __options: useDefaultOptions<RequiredDeep<DTAIOFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA, formatOptions as RequiredDeep<DTAIOFormattingOptions>),
  })

  /**
   * Transforms a `variable` type value to `UndefinedValueObject`.
   * - - - -
   * @returns {UndefinedValueObject}
   */
  static useUndefined = (): UndefinedValueObject => ({
    __type: 'undefined',
    __value: 'undefined',
    __options: DTAIO.formatOptions.defaultMAGMA,
  })

  /**
   * Transforms a `variable` type value to `CommentValueObject`.
   * - - - -
   * @param {string} value The value you want to transform.
   * @returns {CommentValueObject}
   */
  static useComment = (value: string): CommentValueObject => ({
    __type: 'comment',
    __value: value,
  })

  /**
   * Transforms a `variable` type value to `IfDefValueObject`.
   * - - - -
   * @param {string} condition The condition where the IF ELSE will be evaluated.
   * @param {string} valueIfTrue The value you want place if the condition is `true`.
   * @param {string} valueIfFalse The value you want place if the condition is `false`.
   * @param {DTAIOFormattingOptions} [formatOptions] `OPTIONAL` An object with values that manipulates the rendering of this value in specific.
   * - - - -
   * @returns {IfDefValueObject}
   */
  static useIfDef = (condition: string, valueIfTrue: string, valueIfFalse: string, formatOptions?: DTAIOFormattingOptions): IfDefValueObject => ({
    __type: 'ifdef',
    __condition: condition,
    __valueIfTrue: valueIfTrue,
    __valueIfFalse: valueIfFalse,
    __options: useDefaultOptions<RequiredDeep<DTAIOFormattingOptions>>(DTAIO.formatOptions.defaultMAGMA, formatOptions as RequiredDeep<DTAIOFormattingOptions>),
  })

  // #region Class Methods

  /**
   * Adds a new value to the DTA file content.
   * - - - -
   * @param {string} key The key name of the value.
   * @param {DTAIOAddValueTypes} value The value that will be added to the DTA file contents.
   * @returns {void}
   */
  addValue(key: string, value: DTAIOAddValueTypes): void {
    this.content[key] = value
  }

  /**
   * Returns an object with all values added to the DTA file contents.
   * - - - -
   * @returns {Record<string, unknown>}
   */
  toJSON(): Record<string, unknown> {
    return this.content
  }

  /**
   * Converts the DTA structure to DTA file contents.
   * - - - -
   * @returns {string}
   */
  toString(): string {
    const io = new BinaryWriter()

    const objKeys = Object.keys(this.content)
    for (const key of objKeys) {
      const val = DTAIO.valueToObject(this.content[key] as DTAIOAddValueTypes, this.options)

      switch (val.__type) {
        case 'string':
          dtaRenderString(key, val, 0, io)
          break
        case 'str_var':
          dtaRenderVariable(key, val, 0, io)
          break
        case 'number':
          dtaRenderNumber(key, val, 0, io)
          break
        case 'float':
          dtaRenderFloat(key, val, 0, io)
          break
        case 'boolean':
          dtaRenderBoolean(key, val, 0, io)
          break
        case 'object':
          dtaRenderObject(key, val, 0, io)
          break
        case 'array':
          dtaRenderArray(key, val, 0, io)
          break
        case 'comment':
          dtaRenderComment(val.__value, io)
          break
        case 'ifdef':
          dtaRenderIfDef(key, val, 0, io)
          break
        case 'undefined':
          break
      }
    }

    // Handle DTA document formatting
    const { useSpaces } = this.options.dta
    if (useSpaces !== false) return io.toBuffer().toString().replace(/\t/g, ' '.repeat(useSpaces))
    return io.toBuffer().toString()
  }
}
