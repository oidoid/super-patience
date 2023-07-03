import { CardEnt } from './systems/card-system.ts'
import { CursorEnt } from './systems/cursor-system.ts'
import { FollowCamEnt } from './systems/follow-cam-system.ts'
import { FollowPointEnt } from './systems/follow-point-system.ts'
import { PatienceTheDemonEnt } from './systems/patience-the-demon-system.ts'
import { PileHitboxEnt } from './systems/pile-hitbox-system.ts'
import { TallyEnt } from './systems/tally-system.ts'
import { VacantStockEnt } from './systems/vacant-stock-system.ts'

export type Ent =
  & CardEnt
  & CursorEnt
  & FollowCamEnt
  & FollowPointEnt
  & PatienceTheDemonEnt
  & PileHitboxEnt
  & TallyEnt
  & VacantStockEnt
