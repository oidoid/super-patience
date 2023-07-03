import { Sprite } from '@/void'
import { Game } from '../../index.ts'
import { maxTallies } from '../../level/ent-factory.ts'
import { TallyConfig } from '../components/tally-config.ts'

// deno-fmt-ignore
type ZeroToTwenty =  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 | 9 | 10 | 11 |
                    12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type TallyEnt = Readonly<{ tally: TallyConfig; sprite: Sprite }>

export class TallySystem {
  readonly query: (keyof TallyEnt)[] = ['sprite', 'tally']
  run(ents: Iterable<TallyEnt>, game: Game): void {
    for (const ent of ents) {
      const max = maxTallies * 10
      const wins =
        Math.min(10, Math.max(0, game.solitaire.wins - ent.tally.tens * 10)) +
        Math.min(
          10,
          Math.max(0, game.solitaire.wins - max - ent.tally.tens * 10),
        ) as ZeroToTwenty
      ent.sprite.tag = `tally--${wins}`
    }
  }
}
