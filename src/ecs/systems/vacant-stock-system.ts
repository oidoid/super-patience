import { solitaireDeal } from '@/solitaire'
import { Sprite } from '@/void'
import { Game } from '../../index.ts'
import { invalidateSolitaireSprites } from '../../level/level.ts'

export type VacantStockEnt = Readonly<
  { vacantStock: Record<never, never>; sprite: Sprite }
>

export class VacantStockSystem {
  readonly query: (keyof VacantStockEnt)[] = ['vacantStock', 'sprite']
  run(ents: Iterable<VacantStockEnt>, game: Game) {
    if (game.v.ctrl.handled || !game.v.ctrl.isOffStart('A')) return
    for (const ent of ents) {
      if (!ent.sprite.hits(game.cursor)) return
      game.v.ctrl.handled = true
      solitaireDeal(game.solitaire)
      invalidateSolitaireSprites(game)
      return
    }
  }
}
