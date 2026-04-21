import { BinaryReader, createHashFromBuffer, getReadableBytesSize, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'

export const ps3GameIDs = {
  rb1: 'BLUS30050',
  rb3: 'BLUS30463',
} as const

export type RockBandPS3TitleIDs = keyof typeof ps3GameIDs

export interface EDATFileStatObject {
  /**
   * Tells if the EDAT file is encrypted or not.
   */
  isEncrypted: boolean
  /**
   * The folder name which (possibly) the content is decrypted.
   *
   * This variable only is a string when a folder name can be taken from the installed DLC, and they must be installed on RPCS3.
   * Even with this, it's not garanteed if i'll work, since this folder can be renamed.
   */
  devKLicFolderName: string | null
  /**
   * The (possible) DevKLic hash that might decrypt the EDAT content.
   *
   * This variable only is a string when a folder name can be taken from the installed DLC, and they must be installed on RPCS3.
   * Even with this, it's not garanteed if i'll work, since this folder can be renamed.
   */
  devKLicHash: string | null
  /**
   * Contents parsed from the EDAT file header.
   */
  header: {
    /**
     * There are 4 PS3 EDAT (and NPD) format major versions:
     *
     * - 1: compatible with SDK 2.1x or older. Supported since at least PS3 System Software version 1.01.
     * - 2: compatible with SDK 3.0x or older
     * - 3: compatible with SDK 3.7x or older
     * - 4: compatible with SDK ?.?? or older. Supported since certainly some 4.0x System Software version.
     */
    version: number
    /**
     * For PS2 EDAT, PS3 OS requires it to be with activation (i.e. Local DRM). For PS1 PKG, PS3 System Software version 4.00 introduced some changes for installing them with regard to the EDAT DRM type.
     */
    drmType: number
    /**
     * The applcation type.
     */
    applicationType: number
    /**
     * Content ID (with padding to fit 48 bytes).
     */
    contentID: string
    /**
     * QA digest. It seems to be a SHA-1 hash of the non-finalized file (debug SELF/SPRX created with make_fself_npdrm) or of the original EDAT data. Original data are unknown until the whole file is read, so it cannot be used as a check, however it can be used as watermark or zeroed on forged file.
     */
    digest: string
    /**
     * CID-FN hash. AES-CMAC hash of concatenation of Content ID (48 bytes) and EDAT/SELF filename (eg "MINIS.EDAT", "EBOOT.BIN") using the npd_cid_fn_hash_aes_cmac_key. Example: aes_cmac(`55 50 30 35 37 36 2D 4E 50 55 5A 30 30 31 34 39 5F 30 30 2D 56 41 4E 47 55 41 52 44 32 30 30 30 30 30 30 31 00 00 00 00 00 00 00 00 00 00 00 00 4D 49 4E 49 53 2E 45 44 41 54`, npd_cid_fn_hash_aes_cmac_key).
     */
    cidFNHash: string
    /**
     * Header hash. AES CMAC hash of the 0x60 bytes from the beginning of the file using (devklic XOR npd_header_hash_xor_key) as AES-CMAC key. Warning: devklic is an hardcoded klicensee that is not necessarily the klicensee when DRM Type is not Free.
     */
    headerHash: string
    /**
     * Start of the validity period, filled with 00 if not used.
     */
    limitedTimeStart: number
    /**
     * End of the validity period, filled with 00 if not used.
     */
    limitedTimeEnd: number
    /**
     * - 00: EDAT
     * - 01: SDAT
     * - 80: Non Finalized (unsigned)
     */
    edatType: number
    /**
     * - 00: ???
     * - 01: Compressed?
     * - 02: Plain text?
     * - 03: Compressed plain text?
     * - 05: Compressed?
     * - 06: Plain text?
     * - 07: Compressed plain text?
     * - 12: ???
     * - 13: Compressed data?
     * - 60: Data/misc?
     */
    metadataType: number
    /**
     * Default block size is 16 KB (0x4000 bytes). Max block size is 32 KB (0x8000 bytes). Working block sizes are: 1, 2, 4, 8, 16, 32 KB.
     * - - - -
     */
    blockSize: string
    /**
     * Decoded data size.
     */
    dataSize: number
    /**
     * Unknown hash.
     */
    metadataSectionsHash: string
    /**
     * AES-CMAC hash of 160 bytes from the beginning of EDAT file. It uses the hash key as AES-CMAC key and it depends on the file flags and keys. ?What does this mean, see make_npdata by Hykem?
     */
    extendedHeaderHash: string
    /**
     * ECDSA curve type is vsh type 2. ECDSA public key is vsh public key (to check). It can be zeroed on forged file.
     */
    ecdsaMetadataSignature: string
    /**
     * ECDSA curve type is vsh type 2. ECDSA public key is vsh public key (to check). Enabled (only?) for PS2 classic contents: all PS3 CFWs are patched to skip the ECDSA signature check. It can be zeroed on forged file.
     */
    ecdsaHeaderSignature: string
  }
  /**
   * Contents parsed from the EDAT footer.
   */
  footer: {
    /**
     * "EDATA" or "SDATA".
     */
    footerName: string
    /**
     * - Version 1: "packager"
     * - Version 2: "2.4.0.L"
     * - Version 2: "2.4.0.W"
     * - Version 2: "2.7.0.W"
     * - Version 2: "2.7.0.L"
     * - Version 3: "3.1.0.W"
     * - Version 3: "3.3.0.L"
     * - Version 3: "3.3.0.W"
     * - Version 4: "4.0.0.L"
     * - Version 4: "4.0.0.W"
     */
    packagerVersion: string
  }
  /**
   * The size of the EDAT file.
   */
  fileSize: number
}

/**
 * Returns an object with stats of the EDAT file.
 * - - - -
 * @param edatFilePath The path to the EDAT file.
 * @returns {Promise<EDATFileStatObject>}
 */
export const edatStat = async (edatFilePath: FilePathLikeTypes): Promise<EDATFileStatObject> => {
  const edat = pathLikeToFilePath(edatFilePath)
  const reader = await BinaryReader.fromFile(edatFilePath)
  const magic = await reader.readUInt32BE()

  // NPD
  if (magic === 0x4e504400) {
    const fileSize = reader.length
    const isEncrypted = true
    let devKLicFolderName: string | null = null
    let devKLicHash: string | null = null

    const version = await reader.readUInt32BE()
    const drmType = await reader.readUInt32BE()
    const applicationType = await reader.readUInt32BE()
    const contentID = await reader.readUTF8(0x30)
    const digest = await reader.readHex(0x10, false)
    const cidFNHash = await reader.readHex(0x10, false)
    const headerHash = await reader.readHex(0x10, false)
    const limitedTimeStart = Number((await reader.readUInt64BE()).toString())
    const limitedTimeEnd = Number((await reader.readUInt64BE()).toString())
    const edatType = await reader.readUInt8()
    const metadataType = await reader.readUInt24BE()
    const blockSize = await reader.readUInt32BE()
    const dataSize = Number(await reader.readUInt64BE())
    const metadataSectionsHash = await reader.readHex(0x10, false)
    const extendedHeaderHash = await reader.readHex(0x10, false)
    const ecdsaMetadataSignature = await reader.readHex(0x10, false)
    const ecdsaHeaderSignature = await reader.readHex(0x10, false)

    reader.seek(fileSize - 0x10)
    const footerName = (await reader.readUTF8(6)).slice(0, -1)
    const packagerVersion = await reader.readUTF8(10)

    await reader.close()

    devKLicFolderName = edat.gotoDir('../../').name
    devKLicHash = createHashFromBuffer(Buffer.from(`Ih38rtW1ng3r${devKLicFolderName}10025250`), 'md5').toUpperCase()

    return {
      isEncrypted,
      devKLicFolderName,
      devKLicHash,
      header: {
        version,
        drmType,
        applicationType,
        contentID,
        digest,
        cidFNHash,
        headerHash,
        limitedTimeStart,
        limitedTimeEnd,
        edatType,
        metadataType,
        blockSize: getReadableBytesSize(blockSize),
        dataSize,
        metadataSectionsHash,
        extendedHeaderHash,
        ecdsaMetadataSignature,
        ecdsaHeaderSignature,
      },
      footer: {
        footerName,
        packagerVersion,
      },
      fileSize,
    }
  }
  // MThd
  else if (magic === 0x4d546864) throw new Error(`Provided EDAT file "${edat.path}" is a decrypted MIDI file with no HMX EDAT header.`)
  else throw new Error(`Provided EDAT file "${edat.path}" is not a valid EDAT or decrypted MIDI file with no HMX EDAT header.`)
}
