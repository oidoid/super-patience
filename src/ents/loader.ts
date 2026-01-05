import * as V from '@oidoid/void'
import levelJSON from '../assets/init.level.jsonc' with {type: 'json'}
import {newLevelComponents} from '../level/ent-factory.ts'
import {parseComponent} from '../level/level-parser.ts'
import {BoardSys} from './board.ts'
import {CamSys} from './cam.ts'
import {DrawSys} from './draw.ts'
import {PatienceTheDemonSys} from './patience-the-demon.ts'
import {PileHitboxSys} from './pile-hitbox.ts'
import {TallySys} from './tally.ts'
import {VacantStockSys} from './vacant-stock.ts'

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
  v.zoo.addSystem({
    board: new BoardSys(),
    cam: new CamSys(),
    cursor: new V.CursorSys(),
    draw: new DrawSys(),
    hud: new V.HUDSys(),
    ninePatch: new V.NinePatchSys(),
    override: new V.OverrideSys(),
    patienceTheDemon: new PatienceTheDemonSys(),
    pile: new PileHitboxSys(),
    sprite: new V.SpriteSys(),
    tally: new TallySys(),
    textWH: new V.TextWHSys(),
    textXY: new V.TextXYSys(),
    vacantStock: new VacantStockSys()
  })
  const zoo = v.loadLevel(levelJSON, 'default', parseComponent)
  v.zoo.add(...zoo.default, ...newLevelComponents(v), ...zoo.end)
  v.spriteByCard = new Map(
    [...v.zoo.query('card & sprite')].map(ent => [ent.card, ent.sprite])
  )
  ent.loader.level = 'Init'
}
