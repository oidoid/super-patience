import {
  maxTallies,
  SPEnt,
  SPFilmID,
  SPRunState,
  TallyConfig,
} from '@/super-patience'
import { QueryToEnt, Sprite, System } from '@/void'

// deno-fmt-ignore
type ZeroToTwenty =    0 |  1 |  2  | 3 |  4 |  5 |  6 |  7 |  8 | 9 | 10 | 11 |
                      12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type TallyEnt = QueryToEnt<
  { tally: TallyConfig; sprite: Sprite },
  typeof query
>

const query = 'tally & sprite'

export class TallySystem implements System<TallyEnt, SPEnt> {
  readonly query = query
  runEnt(ent: TallyEnt, state: SPRunState) {
    const { sprite, tally } = ent
    const max = maxTallies * 10
    const wins =
      Math.min(10, Math.max(0, state.solitaire.wins - tally.tens * 10)) +
      Math.min(
        10,
        Math.max(0, state.solitaire.wins - max - tally.tens * 10),
      ) as ZeroToTwenty
    const filmID: SPFilmID = `tally--${wins}`
    if (sprite.film.id != filmID) {
      sprite.animate(state.time, state.filmByID[filmID])
    }
  }
}
