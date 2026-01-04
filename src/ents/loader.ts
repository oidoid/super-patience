import type * as V from '@oidoid/void'
import levelJSON from '../assets/init.level.jsonc' with { type: 'json' }
import { newLevelComponents } from '../level/ent-factory.ts'
import { parseLevel } from '../level/level-parser.ts'
import { BoardSys } from './board.ts'
import { CamSys } from './cam.ts'
import { DrawSys } from './draw.ts'
import { PatienceTheDemonSys } from './patience-the-demon.ts'
import { PileHitboxSys } from './pile-hitbox.ts'
import { TallySys } from './tally.ts'
import { VacantStockSys } from './vacant-stock.ts'

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
  v.zoo.add(...level.zoo.default, ...newLevelComponents(v), ...level.zoo.end)
  v.spriteByCard = new Map(
    [...v.zoo.query('card & sprite')].map(ent => [ent.card, ent.sprite])
  )
  v.zoo.addSystem({
    board: new BoardSys(),
    cam: new CamSys(),
    draw: new DrawSys(),
    patienceTheDemon: new PatienceTheDemonSys(),
    pile: new PileHitboxSys(),
    tally: new TallySys(),
    vacantStock: new VacantStockSys()
  })
  // to-do: validate all ents on a system add.
  ent.loader.level = 'Init'
}
