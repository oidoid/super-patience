import type * as V from '@oidoid/void'
import {solitaireDeal} from 'klondike-solitaire'
import {invalidateSolitaireSprites} from '../level/level.ts'

export type VacantStockEnt = V.SysEnt<VacantStockSys>

export class VacantStockSys implements V.Sys {
  readonly query = 'sprite & vacantStock'
  update(ent: VacantStockEnt, v: V.Void): void {
    if (!v.input.isOffStart('A')) return
    if (!v.loader.cursor?.sprite.hitsZ(ent.sprite, v.cam)) return
    v.input.handled = true
    solitaireDeal(v.solitaire)
    invalidateSolitaireSprites(v)
  }
}
