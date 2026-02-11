import { pathLikeToDirPath, StreamWriter, type DirPathLikeTypes } from 'node-lib'
import { FileSystem } from '../../core'
import { extractPKGToTempFolder, sendMessage, type SelectPKGFileReturnObject, moveExtractedFilesToGameDir, useHandlerWithUserConfig } from '../../lib'

export const installPKGFile = useHandlerWithUserConfig(async (win, _, { devhdd0Path }, selectedPKG: SelectPKGFileReturnObject): Promise<string | false> => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  const rb3GameFolder = FileSystem.dirs.rb3BLUS30463(devhdd0)
  const rb2GameFolder = FileSystem.dirs.rb2BLUS30147(devhdd0)
  const rbGameFolder = FileSystem.dirs.rbBLUS30050(devhdd0)

  // Only TU5 and DX and official song packages will extract and just move all files
  if (selectedPKG.pkgType !== 'songPackage') {
    sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'extractingPKGFile' })

    const extractedPKGFolder = await extractPKGToTempFolder(selectedPKG.pkgPath)
    if (!extractedPKGFolder) {
      sendMessage(win, { type: 'error', method: 'installPKGFile', module: 'rpcs3', code: 'extractionError' })
      return false
    }
    sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'movingPKGContents' })

    try {
      const gameFolder = selectedPKG.stat.header.cidTitle1 === 'BLUS30050' ? rbGameFolder : selectedPKG.stat.header.cidTitle1 === 'BLUS30147' ? rb2GameFolder : rb3GameFolder
      await moveExtractedFilesToGameDir(selectedPKG, extractedPKGFolder, gameFolder)
    } catch (err) {
      await extractedPKGFolder.deleteDir(true)
      throw err
    }
    await extractedPKGFolder.deleteDir(true)

    if (selectedPKG.pkgType === 'rb1') {
      sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'creatingRAPFile' })
      const user0ExdataFolder = devhdd0.gotoDir('home/00000001/exdata')
      if (!user0ExdataFolder.exists) await user0ExdataFolder.mkDir(true)
      const rapFilePath = user0ExdataFolder.gotoFile('UP0006-BLUS30050_00-RB1EXPORTCCF0099.rap')
      const writer = await StreamWriter.toFile(rapFilePath)
      writer.writeHex('0xCDC040B4F45B247FC71ADA455F423850')
      await writer.close()
    }

    sendMessage(win, { type: 'success', method: 'installPKGFile', module: 'rpcs3', code: selectedPKG.pkgType === 'tu5' ? 'TU5' : selectedPKG.pkgType === 'dx' ? 'RB3DX' : 'SP' })
  } else {
    return false
  }
  return rb3GameFolder.path
})
