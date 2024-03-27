import type {CardEnt} from './systems/card-system.js'
import type {CursorEnt} from './systems/cursor-system.js'
import type {FollowCamEnt} from './systems/follow-cam-system.js'
import type {FollowPointEnt} from './systems/follow-point-system.js'
import type {PatienceTheDemonEnt} from './systems/patience-the-demon-system.js'
import type {PileHitboxEnt} from './systems/pile-hitbox-system.js'
import type {TallyEnt} from './systems/tally-system.js'
import type {VacantStockEnt} from './systems/vacant-stock-system.js'

export type Ent = CardEnt &
  CursorEnt &
  FollowCamEnt &
  FollowPointEnt &
  PatienceTheDemonEnt &
  PileHitboxEnt &
  TallyEnt &
  VacantStockEnt
