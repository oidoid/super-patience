import { I16Box, Immutable, U16XY, Uint } from '@/oidlib';
import {
  getFoundationCardXY,
  getTableauCardXY,
  PileConfig,
  SublimeECSUpdate,
} from '@/sublime-solitaire';
import { Sprite, System } from '@/void';

export interface PileHitboxSet {
  readonly pile: PileConfig;
  readonly sprite: Sprite;
}

/** Size the pile's hitbox. */
export const PileHitboxSystem: System<PileHitboxSet, SublimeECSUpdate> =
  Immutable(
    {
      query: new Set(['pile', 'sprite']),
      updateEnt(set, update) {
        const { pile, sprite } = set;
        const cardWH = U16XY(24, 32); // to-do: don't hardcode.
        const gap = 8; // to-do: or at least hardcode in one place
        // kind of lame because this shoudl be the union of sprites
        // this should be invisible tho and the sprite should always be present
        const xy = pile.type == 'Tableau'
          ? getTableauCardXY(update.filmByID, pile.x, Uint(0))
          : getFoundationCardXY(update.filmByID, pile.suit);
        I16Box.moveTo(
          sprite.bounds,
          xy.x - gap,
          xy.y - gap,
        );
        I16Box.sizeTo(
          sprite.bounds,
          cardWH.x + gap * 2,
          cardWH.y +
            (pile.type == 'Tableau'
              ? Math.max(
                0,
                update.solitaire.tableau[pile.x]!.length - 1,
              ) * gap
              : 0) +
            gap * 2,
        );
        // to-do: Sprite.sizeTo
        // to-do: don't process picks after it has been handled. Render and pick
        // order need to be distinct.
        // to-do: make the input API a lot more friendly.
      },
    },
  );
