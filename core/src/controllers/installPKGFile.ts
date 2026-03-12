import { isRPCS3Devhdd0PathValid } from 'rbtools/lib'
import type { SelectPKGFileReturnObject } from '../controllers.exports'
import { readUserConfigFile, sendMessage, useHandler } from '../core.exports'
import { installPatchTypePKG } from '../lib.exports'

export const installPKGFile = useHandler(async (win, _, selectedPKG: SelectPKGFileReturnObject): Promise<boolean> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendMessage(win, { method: 'installPKGFile', type: 'error', code: 'noUserConfigFile' })
    return false
  }

  const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
  const rb3GameFolder = devhdd0.gotoDir('game/BLUS30463')
  const rb2GameFolder = devhdd0.gotoDir('game/BLUS30147')
  const rbGameFolder = devhdd0.gotoDir('game/BLUS30050')

  const { pkgType } = selectedPKG
  console.log(selectedPKG)

  if (pkgType === 'dx' || pkgType === 'tu5') {
    sendMessage(win, { type: 'loading', method: 'installPKGFile', code: 'extractingPKGFile', messageValues: { path: selectedPKG.pkgPath } })
    await installPatchTypePKG(rb3GameFolder, selectedPKG)
    sendMessage(win, { type: 'success', method: 'installPKGFile', code: selectedPKG.pkgType === 'tu5' ? 'TU5' : selectedPKG.pkgType === 'dx' ? 'RB3DX' : 'SP' })
    return true
  }

  return true
  //   // Only TU5 and DX and official song packages will extract and just move all files
  //   if (selectedPKG.pkgType !== 'songPackage') {
  //     sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'extractingPKGFile' })

  //     const extractedPKGFolder = await extractPKGToTempFolder(selectedPKG.pkgPath)
  //     if (!extractedPKGFolder) {
  //       sendMessage(win, { type: 'error', method: 'installPKGFile', module: 'rpcs3', code: 'extractionError' })
  //       return false
  //     }
  //     sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'movingPKGContents' })

  //     try {
  //       const gameFolder = selectedPKG.stat.header.cidTitle1 === 'BLUS30050' ? rbGameFolder : selectedPKG.stat.header.cidTitle1 === 'BLUS30147' ? rb2GameFolder : rb3GameFolder
  //       await moveExtractedFilesToGameDir(selectedPKG, extractedPKGFolder, gameFolder)
  //     } catch (err) {
  //       await extractedPKGFolder.deleteDir(true)
  //       throw err
  //     }
  //     await extractedPKGFolder.deleteDir(true)

  //     if (selectedPKG.pkgType === 'rb1') {
  //       sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'creatingRAPFile' })
  //       const user0ExdataFolder = devhdd0.gotoDir('home/00000001/exdata')
  //       if (!user0ExdataFolder.exists) await user0ExdataFolder.mkDir(true)
  //       const rapFilePath = user0ExdataFolder.gotoFile('UP0006-BLUS30050_00-RB1EXPORTCCF0099.rap')
  //       const writer = await StreamWriter.toFile(rapFilePath)
  //       // CDC040B4F45B247FC71ADA455F423850
  //       writer.write(Buffer.from('zcBAtPRbJH/HGtpFX0I4UA==', 'base64'))
  //       await writer.close()
  //     }

  //     sendMessage(win, { type: 'success', method: 'installPKGFile', module: 'rpcs3', code: selectedPKG.pkgType === 'tu5' ? 'TU5' : selectedPKG.pkgType === 'dx' ? 'RB3DX' : 'SP' })
  //   } else {
  //     return false
  //   }
  //   return rb3GameFolder.path
})
