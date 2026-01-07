import { addHandler, getRPCS3InstalledGamesStats, getSaveFileData, installHighMemotyPatch, isDevHDD0PathValid, isRPCS3ExePathValid } from '../../lib'

export function initRBToolsChannels(): void {
  addHandler('@RBTools/getRPCS3InstalledGamesStats', getRPCS3InstalledGamesStats)
  addHandler('@RBTools/getSaveFileData', getSaveFileData)
  addHandler('@RBTools/installHighMemotyPatch', installHighMemotyPatch)
  addHandler('@RBTools/isDevHDD0PathValid', isDevHDD0PathValid)
  addHandler('@RBTools/isRPCS3ExePathValid', isRPCS3ExePathValid)
}
