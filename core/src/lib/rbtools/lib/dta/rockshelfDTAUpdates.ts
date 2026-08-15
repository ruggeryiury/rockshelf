import type { DTAFileUpdateObject, PartialDTAFile } from './dtaStruct'

export const rockshelfDTAUpdates: DTAFileUpdateObject[] = [
  // RB2-Rock-Band-2-Export.dta
  { id: 'anywayyouwantit', rating: 1 },
  { id: 'battery', rating: 2 },
  { id: 'espoonman', rating: 2 },
  { id: 'giveiteway', rating: 2 },

  // RB4-to-RB2-DLC-1.dta
  { id: '18andlife', game_origin: 'ugc_plus', customsource: { game_origin: 'rb4_dlc' } },
  { id: 'irememberyou', game_origin: 'ugc_plus', customsource: { game_origin: 'rb4_dlc' } },
]
