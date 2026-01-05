import { addHandler, isDevHDD0PathValid } from '../../lib'

export function initRBToolsChannels(): void {
  addHandler('@RBTools/isDevHDD0PathValid', isDevHDD0PathValid)
}
