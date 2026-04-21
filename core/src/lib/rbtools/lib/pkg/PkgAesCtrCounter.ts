import { createDecipheriv, type Decipheriv } from 'node:crypto'

/**
 * Represents an AES-CTR counter object that supports seeking and decryption.
 * - - - -
 */
export class PkgAesCtrCounter {
  private key: Buffer
  private iv: bigint
  private blockOffset = -1
  private blockSize = 16
  private aes?: Decipheriv

  /**
   * Create a new AES CTR counter stream.
   * - - - -
   * @param {Buffer} key The AES key.
   * @param {Buffer} iv The initial counter or IV.
   */
  constructor(key: Buffer, iv: Buffer) {
    this.key = key
    this.iv = BigInt('0x' + iv.toString('hex'))
  }

  /**
   * Updates the internal AES CTR cipher stream to a new offset.
   * - - - -
   * @param {number} offset The offset to set.
   */
  private setOffset(offset: number) {
    if (offset === this.blockOffset) return

    let startCounter = this.iv
    this.blockOffset = 0
    const count = Math.floor(offset / this.blockSize)
    if (count > 0) {
      startCounter += BigInt(count)
      this.blockOffset += count * this.blockSize
    }

    const counterBlock = Buffer.alloc(16)
    counterBlock.writeBigUInt64BE(startCounter >> 64n, 0)
    counterBlock.writeBigUInt64BE(startCounter & 0xffffffffffffffffn, 8)

    this.aes = createDecipheriv('aes-128-ctr', this.key, counterBlock)
  }

  /**
   * Decrypts data at a given offset using AES CTR mode.
   * - - - -
   * @param {number} offset Byte offset into the stream.
   * @param {Buffer | Uint8Array} data Data to decrypt.
   * @returns {Buffer}
   */
  decrypt(offset: number, data: Buffer | Uint8Array): Buffer {
    this.setOffset(offset)
    this.blockOffset += data.length
    if (!this.aes) throw new Error('AES stream not initialized')
    return this.aes.update(Buffer.from(data))
  }

  toString(): string {
    return this.key.toString('hex')
  }
}
