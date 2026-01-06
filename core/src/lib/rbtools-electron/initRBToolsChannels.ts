import { addHandler, getRPCS3InstalledGamesStats, isDevHDD0PathValid, isRPCS3ExePathValid } from '../../lib'

export function initRBToolsChannels(): void {
  addHandler('@RBTools/getRPCS3InstalledGamesStats', getRPCS3InstalledGamesStats)
  addHandler('@RBTools/isDevHDD0PathValid', isDevHDD0PathValid)
  addHandler('@RBTools/isRPCS3ExePathValid', isRPCS3ExePathValid)
}
