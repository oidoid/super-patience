import { Solitaire } from '@/solitaire'
import {
  setSpritePositionsForLayout,
  SPEnt,
  SuperPatience,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type VacantStockEnt = QueryEnt<
  { vacantStock: Record<never, never>; sprite: Sprite },
  typeof query
>

const query = 'vacantStock & sprite'

export class VacantStockSystem implements System<VacantStockEnt, SPEnt> {
  readonly query = query
  run(ents: ReadonlySet<VacantStockEnt>, game: SuperPatience) {
    if (game.pickHandled || !game.input.isOffStart('Action')) return
    for (const ent of ents) {
      if (!ent.sprite.intersectsBounds(game.cursor.bounds.xy)) return
      game.pickHandled = true
      Solitaire.deal(game.solitaire)
      setSpritePositionsForLayout(
        game.ecs,
        game.filmByID,
        game.solitaire,
        game.time,
      )
      return
    }
  }
}
