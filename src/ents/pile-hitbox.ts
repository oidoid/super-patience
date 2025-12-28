import type * as V from '@oidoid/void'
import {
  cardWH,
  getFoundationCardXY,
  getTableauCardXY,
  mod
} from '../level/level.ts'

export type PileHitboxEnt = V.SysEnt<PileHitboxSystem>

/** size the pile's hitbox. */
export class PileHitboxSystem implements V.Sys {
  readonly query = 'pile & sprite'
  update(ent: PileHitboxEnt, v: V.Void): void {
    // to-do: why isn't this in the invalidateSolitaireSprites() fn? Seems like it
    // only applies to those sprite queries. Or vice-versa. Why can't those be
    // systems.
    const {pile, sprite} = ent
    const xy =
      pile.type === 'Waste'
        ? {x: sprite.x + mod - 1, y: sprite.y + mod - 1}
        : pile.type === 'Tableau'
          ? getTableauCardXY(v.preload, pile.x, 0)
          : getFoundationCardXY(v.preload, pile.suit)
    sprite.x = xy.x - mod + 1
    sprite.y = xy.y - mod + 1
    sprite.w = cardWH.w + mod * 2 - 1
    sprite.h =
      cardWH.h +
      (pile.type === 'Waste'
        ? (v.solitaire.waste.length > 0 ? v.solitaire.drawSize - 1 : 0) * mod
        : pile.type === 'Tableau'
          ? ((v.solitaire.tableau[pile.x]?.length ?? 1) - 1) * mod
          : 0) +
      mod * 2 -
      1
  }
}
