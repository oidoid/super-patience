import { U16XY, Uint } from '@/ooz'
import {
  getFoundationCardXY,
  getTableauCardXY,
  PileConfig,
  SPEnt,
  SuperPatience,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type PileHitboxEnt = QueryEnt<
  { pile: PileConfig; sprite: Sprite },
  typeof query
>

const query = 'pile & sprite'

/** Size the pile's hitbox. */
export class PileHitboxSystem implements System<PileHitboxEnt, SPEnt> {
  readonly query = query
  runEnt(ent: PileHitboxEnt, game: SuperPatience): void {
    const { pile, sprite } = ent
    const cardWH = new U16XY(24, 32) // to-do: don't hardcode.
    const gap = 8 // to-do: or at least hardcode in one place
    // kind of lame because this shoudl be the union of sprites
    // this should be invisible tho and the sprite should always be present
    const xy = pile.type == 'Waste'
      ? sprite.bounds.xy.copy().addTrunc(gap - 1, gap - 1)
      : pile.type == 'Tableau'
      ? getTableauCardXY(game.filmByID, pile.x, Uint(0))
      : getFoundationCardXY(game.filmByID, pile.suit)
    sprite.bounds.moveToTrunc(
      xy.x - gap + 1,
      xy.y - gap + 1,
    )
    sprite.bounds.sizeToTrunc(
      cardWH.x + gap * 2 - 1,
      cardWH.y +
        (pile.type == 'Waste'
          ? (game.solitaire.waste.length > 0
            ? game.solitaire.drawSize - 1
            : 0) * gap
          : pile.type == 'Tableau'
          ? Math.max(
            0,
            game.solitaire.tableau[pile.x]!.length - 1,
          ) * gap
          : 0) +
        gap * 2 - 1,
    )
    // to-do: don't process picks after it has been handled. Render and pick
    // order need to be distinct.
  }
}
