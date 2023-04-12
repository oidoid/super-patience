import { solitaireDeal } from '@/solitaire'
import {
  invalidateSolitaireSprites,
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
      if (!ent.sprite.intersectsBounds(game.cursor)) return
      game.pickHandled = true
      solitaireDeal(game.solitaire)
      invalidateSolitaireSprites(
        game.ecs,
        game.filmByID,
        game.solitaire,
        game.time,
      )
      return
    }
  }
}
