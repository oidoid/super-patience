import { Immutable, U16XY, Uint } from '@/oidlib'
import {
  getFoundationCardXY,
  getTableauCardXY,
  PileConfig,
  SPECSUpdate,
} from '@/super-patience'
import { Sprite, System } from '@/void'

export interface PileHitboxSet {
  readonly pile: PileConfig
  readonly sprite: Sprite
}

/** Size the pile's hitbox. */
export const PileHitboxSystem: System<PileHitboxSet, SPECSUpdate> = Immutable(
  {
    query: new Set(['pile', 'sprite']),
    updateEnt(set, update) {
      const { pile, sprite } = set
      const cardWH = new U16XY(24, 32) // to-do: don't hardcode.
      const gap = 8 // to-do: or at least hardcode in one place
      // kind of lame because this shoudl be the union of sprites
      // this should be invisible tho and the sprite should always be present
      const xy = pile.type == 'Waste'
        ? sprite.bounds.xy.copy().addTrunc(gap - 1, gap - 1)
        : pile.type == 'Tableau'
        ? getTableauCardXY(update.filmByID, pile.x, Uint(0))
        : getFoundationCardXY(update.filmByID, pile.suit)
      sprite.bounds.moveToTrunc(
        xy.x - gap + 1,
        xy.y - gap + 1,
      )
      sprite.bounds.sizeToTrunc(
        cardWH.x + gap * 2 - 1,
        cardWH.y +
          (pile.type == 'Waste'
            ? (update.solitaire.waste.length > 0
              ? update.solitaire.drawSize - 1
              : 0) * gap
            : pile.type == 'Tableau'
            ? Math.max(
              0,
              update.solitaire.tableau[pile.x]!.length - 1,
            ) * gap
            : 0) +
          gap * 2 - 1,
      )
      // to-do: Sprite.sizeTo
      // to-do: don't process picks after it has been handled. Render and pick
      // order need to be distinct.
      // to-do: make the input API a lot more friendly.
    },
  },
)
