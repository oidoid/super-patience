import {
  cardWH,
  getFoundationCardXY,
  getTableauCardXY,
  mod,
  PileConfig,
  SPEnt,
  SuperPatience,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type PileHitboxEnt = QueryEnt<
  { pile: PileConfig; sprites: [Sprite, ...Sprite[]] },
  typeof query
>

const query = 'pile & sprites'

/** Size the pile's hitbox. */
export class PileHitboxSystem implements System<PileHitboxEnt, SPEnt> {
  readonly query = query
  // to-do: why isn't this in the invalidateSolitaireSprites() fn? Seems like it
  // only applies to those sprite queries. Or vice-versa. Why can't those be
  // systems.
  runEnt(ent: PileHitboxEnt, game: SuperPatience): void {
    const { pile, sprites } = ent
    // kind of lame because this shoudl be the union of sprites
    // this should be invisible tho and the sprite should always be present
    const xy = pile.type === 'Waste'
      ? sprites[0].bounds.xy.copy().add(mod - 1, mod - 1)
      : pile.type === 'Tableau'
      ? getTableauCardXY(game.filmByID, pile.x, 0)
      : getFoundationCardXY(game.filmByID, pile.suit)
    sprites[0].setXY(xy.x - mod + 1, xy.y - mod + 1)
    sprites[0].w = cardWH.x + mod * 2 - 1
    sprites[0].h = cardWH.y +
      (pile.type === 'Waste'
        ? (game.solitaire.waste.length > 0 ? game.solitaire.drawSize - 1 : 0) *
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
