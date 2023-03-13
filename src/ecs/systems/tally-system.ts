import {
  maxTallies,
  SPEnt,
  SPFilmID,
  SuperPatience,
  TallyConfig,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

// deno-fmt-ignore
type ZeroToTwenty =  0 |  1 |  2  | 3 |  4 |  5 |  6 |  7 |  8 | 9 | 10 | 11 |
                    12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type TallyEnt = QueryEnt<
  { tally: TallyConfig; sprite: Sprite },
  typeof query
>

const query = 'tally & sprite'

export class TallySystem implements System<TallyEnt, SPEnt> {
  readonly query = query
  runEnt(ent: TallyEnt, game: SuperPatience) {
    const { sprite, tally } = ent
    const max = maxTallies * 10
    const wins =
      Math.min(10, Math.max(0, game.solitaire.wins - tally.tens * 10)) +
      Math.min(
        10,
        Math.max(0, game.solitaire.wins - max - tally.tens * 10),
      ) as ZeroToTwenty
    const filmID: SPFilmID = `tally--${wins}`
    if (sprite.film.id != filmID) {
      sprite.animate(game.time, game.filmByID[filmID])
    }
  }
}
