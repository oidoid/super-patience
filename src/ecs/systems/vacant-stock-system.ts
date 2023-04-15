import { solitaireDeal } from '@/solitaire'
import {
  invalidateSolitaireSprites,
  SPEnt,
  SuperPatience,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type VacantStockEnt = QueryEnt<
  { vacantStock: Record<never, never>; sprites: [Sprite, ...Sprite[]] },
  typeof query
>

const query = 'vacantStock & sprites'

export class VacantStockSystem implements System<VacantStockEnt, SPEnt> {
  readonly query = query
  run(ents: ReadonlySet<VacantStockEnt>, game: SuperPatience) {
    if (game.pickHandled || !game.input.isOffStart('Action')) return
    for (const ent of ents) {
      if (!ent.sprites[0].hits(game.cursor)) return
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
