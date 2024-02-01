import { Sprite } from '@/void'
import { Game } from '../../index.ts'
import {
  cardWH,
  getFoundationCardXY,
  getTableauCardXY,
  mod,
} from '../../level/level.ts'
import { PileConfig } from '../components/pile-config.ts'

export type PileHitboxEnt = {
  readonly pile: PileConfig
  readonly sprite: Sprite
}

/** Size the pile's hitbox. */
export class PileHitboxSystem {
  readonly query: (keyof PileHitboxEnt)[] = ['pile', 'sprite']
  run(ents: Iterable<PileHitboxEnt>, game: Game): void {
    for (const ent of ents) {
      // to-do: why isn't this in the invalidateSolitaireSprites() fn? Seems like it
      // only applies to those sprite queries. Or vice-versa. Why can't those be
      // systems.
      const { pile, sprite } = ent
      const xy = pile.type === 'Waste'
        ? { x: sprite.x + mod - 1, y: sprite.y + mod - 1 }
        : pile.type === 'Tableau'
        ? getTableauCardXY(game.v.atlas, pile.x, 0)
        : getFoundationCardXY(game.v.atlas, pile.suit)
      sprite.x = xy.x - mod + 1
      sprite.y = xy.y - mod + 1
      sprite.w = sprite.hitbox.w = cardWH.w + mod * 2 - 1
      sprite.h = sprite.hitbox.h = cardWH.h +
        (pile.type === 'Waste'
          ? (game.solitaire.waste.length > 0
            ? game.solitaire.drawSize - 1
            : 0) *
            mod
          : pile.type === 'Tableau'
          ? Math.max(
            0,
            game.solitaire.tableau[pile.x]!.length - 1,
          ) * mod
          : 0) +
        mod * 2 - 1
    }
  }
}
