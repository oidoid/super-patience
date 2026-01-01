import type * as V from '@oidoid/void'
import levelJSON from '../assets/init.level.jsonc' with {type: 'json'}
import {newLevelComponents} from '../level/ent-factory.ts'
import {parseLevel} from '../level/level-parser.ts'
import {BoardSystem} from './board.ts'
import {CamSys} from './cam.ts'
import {DrawSys} from './draw.ts'
import {PatienceTheDemonSystem} from './patience-the-demon.ts'
import {PileHitboxSystem} from './pile-hitbox.ts'
import {TallySystem} from './tally.ts'
import {VacantStockSystem} from './vacant-stock.ts'

export class LoaderSys implements V.Sys {
  readonly query = 'loader'

  update(ent: V.LoaderEnt, v: V.Void): void {
    switch (ent.loader.level) {
      case undefined: {
        init(ent, v)
        return
      }
      case 'Init':
        return
      default:
        ent.loader.level satisfies never
    }
  }
}

function init(ent: V.LoaderEnt, v: V.Void): void {
  v.zoo.addDefaultSystems()
  const level = parseLevel(levelJSON, v.pool, v.preload)
  v.zoo.add(...level.ents, ...newLevelComponents(v), {draw: {}}) // to-do: support ent ordering. can't put this in level file right now.
  v.spriteByCard = new Map(
    [...v.zoo.query('card & sprite')].map(ent => [ent.card, ent.sprite])
  )
  v.zoo.addSystem({
    board: new BoardSystem(),
    cam: new CamSys(),
    draw: new DrawSys(),
    patienceTheDemon: new PatienceTheDemonSystem(),
    pile: new PileHitboxSystem(),
    tally: new TallySystem(),
    vacantStock: new VacantStockSystem()
  })
  // to-do: validate all ents on a system add.
  ent.loader.level = 'Init'
}
