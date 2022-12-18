import { Immutable } from '@/oidlib';
import { SublimeFilmID, SublimeUpdate, TallyConfig } from '@/sublime-solitaire';
import { Sprite, System } from '@/void';

type ZeroToTen = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TallySet {
  readonly tally: TallyConfig;
  readonly sprite: Sprite;
}

export const TallySystem: System<TallySet, SublimeUpdate> = Immutable({
  query: new Set(['tally', 'sprite']),
  updateEnt(set, update) {
    const { sprite, tally } = set;
    const wins = Math.min(
      10,
      Math.max(0, update.solitaire.wins - tally.tens * 10),
    ) as ZeroToTen;
    const filmID: SublimeFilmID = `Tally${wins}`;
    if (sprite.animator.film.id != filmID) {
      Sprite.reset(sprite, update.time, update.filmByID[filmID]);
    }
  },
});
