import type * as V from '@oidoid/void'
import {maxTallies} from '../level/ent-factory.ts'

// biome-ignore format:;
type ZeroToTwenty =  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 | 9 | 10 | 11 |  
                    12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type TallyEnt = V.SysEnt<TallySys>

export class TallySys implements V.Sys {
  readonly query = 'sprite & tally'
  update(ent: TallyEnt, v: V.Void): void {
    const max = maxTallies * 10
    const wins = (Math.min(
      10,
      Math.max(0, v.solitaire.wins - ent.tally.tens * 10)
    ) +
      Math.min(
        10,
        Math.max(0, v.solitaire.wins - max - ent.tally.tens * 10)
      )) as ZeroToTwenty
    ent.sprite.tag = `tally--${wins}`
  }
}
