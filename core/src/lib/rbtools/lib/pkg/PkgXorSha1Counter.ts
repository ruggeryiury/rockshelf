import { createHash } from 'node:crypto'

/**
 * A custom SHA1-based stream decryption counter.
 * Simulates AES-CTR-like behavior using SHA1 and XOR blocks.
 * - - - -
 */
export class PkgXorSha1Counter {
  private iv: bigint
  private counter: bigint
  private blockOffset = 0
  private blockSize = 16

  /**
   * Creates an instance of PkgXorSha1Counter.
   * - - - -
   * @param {Buffer} iv A 64-byte Buffer or integer used as the initial counter value.
   */
  constructor(iv: Buffer) {
    this.iv = BigInt('0x' + iv.toString('hex'))
    this.counter = this.iv
  }

  /**
   * Sets the internal counter to match a given offset in the stream.
   * - - - -
   * @param {number} offset Byte offset from the beginning of the stream.
   */
  private setOffset(offset: number) {
    if (offset === this.blockOffset) return

    this.counter = this.iv
    this.blockOffset = 0

    const count = Math.floor(offset / this.blockSize)
    if (count > 0) {
      this.counter += BigInt(count)
      this.blockOffset += count * this.blockSize
    }
  }

  /**
   * Decrypts a block of data at the given offset using SHA1-based XOR blocks.
   * - - - -
   * @param {number} offset Offset in the stream where decryption should begin.
   * @param {Buffer} encryptedData The encrypted data to decrypt.
   * @returns {Buffer} A Buffer containing the decrypted data.
   */
  decrypt(offset: number, encryptedData: Buffer): Buffer {
    this.setOffset(offset)
    this.blockOffset += encryptedData.length

    const decryptedData = Buffer.alloc(encryptedData.length)

    for (let i = 0; i < encryptedData.length; i += this.blockSize) {
      const counterBytes = this.bigIntToBuffer(this.counter, 0x40) // 64 bytes
      const sha1Digest = createHash('sha1').update(counterBytes).digest()
      const xorBlock = sha1Digest.subarray(0, this.blockSize)

      const chunk = encryptedData.subarray(i, i + this.blockSize)
      for (let j = 0; j < chunk.length; j++) {
        decryptedData[i + j] = chunk[j] ^ xorBlock[j]
      }

      this.counter += 1n
    }

    return decryptedData
  }
  /**
   * Returns the string representation of the initial IV as a hex string.
   * - - - -
   * @returns {string} A hexadecimal string of the IV padded to 64 bytes.
   */
  toString(): string {
    const hex = this.iv.toString(16).padStart(0x40 * 2, '0')
    return hex
  }

  private bigIntToBuffer(num: bigint, size: number): Buffer {
    const hex = num.toString(16).padStart(size * 2, '0')
    return Buffer.from(hex, 'hex')
  }
}
