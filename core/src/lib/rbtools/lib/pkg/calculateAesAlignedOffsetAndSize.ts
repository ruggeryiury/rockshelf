import { MyObject } from 'node-lib'

export interface CalculatedAesOffsetAndSizeObject {
  offsetDelta: number
  offset: number
  sizeDelta: number
  size: number
}

export const calculateAesAlignedOffsetAndSize = (offset: number, size: number): CalculatedAesOffsetAndSizeObject => {
  const blockSize = 0x10 // AES block size in bytes
  const map = new MyObject<CalculatedAesOffsetAndSizeObject>()

  const offsetDelta = offset & (blockSize - 1)
  map.setMany({
    offsetDelta,
    offset: offset - offsetDelta,
  })

  let sizeDelta = (offsetDelta + size) & (blockSize - 1)

  if (sizeDelta > 0) {
    sizeDelta = blockSize - sizeDelta
  }
  sizeDelta += offsetDelta
  map.setMany({
    sizeDelta,
    size: size + sizeDelta,
  })
  map.set('sizeDelta', sizeDelta)
  map.set('size', size + sizeDelta)

  return map.toJSON()
}
