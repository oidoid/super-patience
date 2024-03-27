import {Sprite} from '@oidoid/void'
import type {SPAnimTag} from '../../assets/sp-anim-tag.js'
import type {Game} from '../../index.js'
import {maxTallies} from '../../level/ent-factory.js'
import type {TallyConfig} from '../components/tally-config.js'

// prettier-ignore
type ZeroToTwenty =  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 | 9 | 10 | 11 |
                    12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type TallyEnt = {
  readonly tally: TallyConfig
  readonly sprite: Sprite<SPAnimTag>
}

export class TallySystem {
  readonly query: (keyof TallyEnt)[] = ['sprite', 'tally']
  run(ents: Iterable<TallyEnt>, game: Game): void {
    for (const ent of ents) {
      const max = maxTallies * 10
      const wins = <ZeroToTwenty>(
        (Math.min(10, Math.max(0, game.solitaire.wins - ent.tally.tens * 10)) +
          Math.min(
            10,
            Math.max(0, game.solitaire.wins - max - ent.tally.tens * 10)
          ))
      )
      ent.sprite.tag = `tally--${wins}`
    }
  }
}
