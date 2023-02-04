import { Immutable } from '@/oidlib'
import {
  maxTallies,
  SPECSUpdate,
  SPFilmID,
  TallyConfig,
} from '@/super-patience'
import { Sprite, System } from '@/void'

// deno-fmt-ignore
type ZeroToTwenty =  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
                    14 | 15  |16 | 17 |18 |19 |20

export interface TallySet {
  readonly tally: TallyConfig
  readonly sprites: [Sprite, ...Sprite[]]
}

export const TallySystem: System<TallySet, SPECSUpdate> = Immutable({
  query: new Set(['tally', 'sprites']),
  updateEnt(set, update) {
    const { sprites: [sprite], tally } = set
    const max = maxTallies * 10
    const wins =
      Math.min(10, Math.max(0, update.solitaire.wins - tally.tens * 10)) +
      Math.min(
        10,
        Math.max(0, update.solitaire.wins - max - tally.tens * 10),
      ) as ZeroToTwenty
    const filmID: SPFilmID = `Tally${wins}`
    if (sprite.film.id != filmID) {
      sprite.animate(update.time, update.filmByID[filmID])
    }
  },
})
