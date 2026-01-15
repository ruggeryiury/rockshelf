import { addHandler, installHighMemoryPatch, isDevHDD0PathValid, isRPCS3ExePathValid } from '../../../lib'

export function initRBToolsChannels(): void {
  addHandler('@RBTools/installHighMemoryPatch', installHighMemoryPatch)
  addHandler('@RBTools/isDevHDD0PathValid', isDevHDD0PathValid)
  addHandler('@RBTools/isRPCS3ExePathValid', isRPCS3ExePathValid)
}
