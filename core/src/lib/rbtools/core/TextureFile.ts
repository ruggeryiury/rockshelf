import { BinaryReader, BinaryWriter, type FilePath, pathLikeToFilePath, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { PythonAPI, type ImageConvertingOptions, type ImageFile, type ImageFormatTypes } from '../core.exports'
import { getDDSHeader, getTPLHeader, texWiiStat, texWiiToImage, texXboxPs3Stat, texXboxPs3ToImage, type TextureFileStatReturnObject } from '../lib.exports'

// #region Types
export interface TextureFileJSONRepresentation extends FilePathJSONRepresentation, TextureFileStatReturnObject {}
export type TextureFormatTypes = 'png_xbox' | 'png_ps3' | 'png_wii'
export type TextureSizeTypes = 128 | 256 | 512 | 1024 | 2048

/**
 * `TextureFile` is a class that represents a texture file.
 */
export class TextureFile {
  // #region Constructor
  /**
   * The path to the image file.
   */
  path: FilePath

  /**
   * `ImageFile` is a class that represents an image file.
   * - - - -
   * @param {FilePathLikeTypes} imgFilePath The path of the image file.
   */
  constructor(imgFilePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(imgFilePath)
  }

  // #region Methods

  /**
   * Checks if a path resolves to an existing image file.
   * - - - -
   * @returns {boolean}
   * @throws {Error} If the instance image file path does not exists.
   */
  async checkFileIntegrity(): Promise<boolean> {
    if (!this.path.exists) throw new Error(`Provided image file path "${this.path.path}" does not exists.`)
    const magic = BinaryReader.fromBuffer(await this.path.readOffset(0, 2))
    const firstByte = await magic.readUInt8()
    const secondByte = await magic.readUInt8()
    let proof = true
    if (firstByte !== 1 && firstByte !== 2) proof = false
    if (secondByte !== 4 && secondByte !== 8) proof = false
    if (!proof) throw new Error(`Provided texture file "${this.path.path}" is not a valid texture file.`)
    return true
  }

  /**
   * Returns an object with stats of the texture file.
   * - - - -
   * @returns {Promise<TextureFileStatReturnObject>}
   */
  async stat(): Promise<TextureFileStatReturnObject> {
    await this.checkFileIntegrity()
    if (this.path.ext === '.png_wii') return await texWiiStat(this.path)
    else return await texXboxPs3Stat(this.path)
  }

  /**
   * Returns a JSON representation of this `TextureFile` class.
   *
   * This method is very similar to `.stat()`, but also returns information about the texture file path.
   * - - - -
   * @returns {Promise<TextureFileJSONRepresentation>}
   */
  async toJSON(): Promise<TextureFileJSONRepresentation> {
    return {
      ...this.path.toJSON(),
      ...(await this.stat()),
    }
  }

  /**
   * Convert this texture file to an image format, returning an instance of `ImageFile` pointing to the new converted image.
   *
   * By passing an argument to `options` parameter, you can tweak the dimensions of the new converted file.
   * - - - -
   * @param {FilePathLikeTypes} destPath The destination path of the new converted image. The new image extension is automatically placed based on the `toFormat` argument.
   * @param {ImageFormatTypes} toFormat The format of the new converted image.
   * @param {ImageConvertingOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the image processing and converting.
   * @returns {Promise<ImageFile>}
   */
  async convertToImage(destPath: FilePathLikeTypes, toFormat: ImageFormatTypes, options?: ImageConvertingOptions): Promise<ImageFile> {
    const { width: srcWidth, height: srcHeight } = await this.stat()
    const opts = useDefaultOptions(
      {
        width: srcWidth,
        height: srcHeight,
        interpolation: 'lanczos',
        quality: 100,
      },
      options
    )
    const dest = pathLikeToFilePath(destPath).changeFileExt(toFormat)
    if (opts.quality < 1 || opts.quality > 100) throw new TypeError(`Quality value must be a number value from 1 to 100, given ${opts.quality.toString()}`)
    if (this.path.ext === dest.ext && this.path.name === dest.name) throw new TypeError('Source and destination file has the same file name and extension')

    if (this.path.ext === '.png_wii') return texWiiToImage(this.path, dest, toFormat)
    return await texXboxPs3ToImage(this.path, dest, toFormat)
  }

  /**
   * Returns a DataURL string of the texture file, using WEBP encoding.
   * - - - -
   * @returns {Promise<string>}
   */
  async toDataURL(): Promise<string> {
    if (this.path.ext === '.png_wii') {
      const base64 = await PythonAPI.texWiiToBase64Buffer(this.path, await getTPLHeader(this.path))
      return `data:image/webp;base64,${base64}`
    }

    const writer = new BinaryWriter()
    const srcBuffer = await this.path.read()
    // 32 is the size of the texture file header we need to skip
    const srcContents = this.path.ext === '.png_ps3' ? srcBuffer.subarray(32) : srcBuffer.subarray(32).swap16()

    const fullHeader = srcBuffer.subarray(0, 16)
    const shortHeader = srcBuffer.subarray(5, 11)

    const srcHeader = await getDDSHeader(fullHeader, shortHeader)

    writer.write(srcHeader.data)
    writer.write(srcContents)

    const base64 = (await PythonAPI.imageBufferProcessor(writer.toBuffer(), 'webp', { height: 256, width: 256 })).toString('base64')

    return `data:image/webp;base64,${base64}`
  }
}
