/**
 * Advances the DTB pseudo-random key stream by one step.
 *
 * This function implements a deterministic pseudo-random number generator
 * used by DTB/DTA file encryption in Harmonix titles. It behaves similarly
 * to a Lehmer / linear congruential RNG variant, operating entirely in
 * unsigned 32-bit integer space.
 *
 * @param {number} key Current 32-bit unsigned key value
 * @returns {number} Next 32-bit unsigned key value in the DTB key stream
 */
export const dtbNextKey = (key: number): number => {
  let val = (((key - Math.floor(key / 0x1f31d) * 0x1f31d) * 0x41a7) >>> 0) - ((Math.floor(key / 0x1f31d) * 0xb14) >>> 0)
  if (val <= 0) val = (val - 0x80000000 - 1) >>> 0
  return val
}

/**
 * Encrypts or decrypts a DTB/DTA data buffer using a stream cipher.
 *
 * The first 4 bytes of the input buffer are interpreted as a little-endian
 * 32-bit seed used to initialize the DTB key stream. Each subsequent byte
 * is XOR'd with the lowest byte of the evolving key value.
 *
 * Because XOR is symmetric, this function can be used for both encryption
 * and decryption.
 *
 * @param {Buffer} input Buffer containing a 4-byte key seed followed by encrypted or decrypted data
 * @returns {Buffer} A new Buffer containing the transformed data (excluding the seed)
 */
export const newDTBCrypt = (input: Buffer): Buffer => {
  let key = input.readUInt32LE(0)
  const outSize = input.length - 4
  const output = Buffer.alloc(outSize)
  for (let i = 0; i < outSize; i++) {
    key = dtbNextKey(key)
    output[i] = (input[i + 4] & 0xff) ^ (key & 0xff)
  }
  return output
}
