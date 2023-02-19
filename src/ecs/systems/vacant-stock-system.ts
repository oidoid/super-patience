import { Solitaire } from '@/solitaire'
import {
  setSpritePositionsForLayout,
  SPEnt,
  SPRunState,
} from '@/super-patience'
import { QueryToEnt, Sprite, System } from '@/void'

export type VacantStockEnt = QueryToEnt<
  { vacantStock: Record<never, never>; sprite: Sprite },
  typeof query
>

const query = 'vacantStock & sprite'

export class VacantStockSystem implements System<VacantStockEnt, SPEnt> {
  readonly query = query
  run(ents: ReadonlySet<VacantStockEnt>, state: SPRunState) {
    if (!!state.pickHandled || !state.input.isOffStart('Action')) return
    for (const ent of ents) {
      if (state.pickHandled) return
      if (!ent.sprite.intersectsBounds(state.cursor.bounds.xy)) return
      state.pickHandled = true
      Solitaire.deal(state.solitaire)
      setSpritePositionsForLayout(
        state.ecs,
        state.filmByID,
        state.solitaire,
        state.time,
      )
    }
  }
}
