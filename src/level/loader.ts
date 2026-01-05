import * as V from '@oidoid/void'
import levelJSON from '../assets/init.level.jsonc' with {type: 'json'}
import {BoardSys} from '../ents/board.ts'
import {CamSys} from '../ents/cam.ts'
import {DrawSys} from '../ents/draw.ts'
import type {CardEnt, PileEnt} from '../ents/ent.ts'
import {PatienceTheDemonSys} from '../ents/patience-the-demon.ts'
import {PileHitboxSys} from '../ents/pile-hitbox.ts'
import {TallySys} from '../ents/tally.ts'
import {type VacantStockEnt, VacantStockSys} from '../ents/vacant-stock.ts'
import {newLevelComponents} from '../level/ent-factory.ts'
import {parseComponent} from '../level/level-parser.ts'

export class Loader implements V.Loader {
  cursor: V.CursorEnt | undefined
  cards: CardEnt[] = []
  piles: PileEnt[] = []
  vacantStock: VacantStockEnt | undefined
  #lvl: 'Init' | undefined
  readonly #systems: V.SysMap = {
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
  }
  #zoo: V.Zoo = {default: new Set(), end: new Set()}

  update(v: V.Void): void {
    switch (this.#lvl) {
      case undefined:
        this.#init(v)
        break
      case 'Init':
        break
      default:
        this.#lvl satisfies never
    }

    for (const zoo of Object.values(this.#zoo))
      V.zooUpdate(zoo, this.#systems, v)
  }

  #init(v: V.Void): void {
    this.#zoo = v.loadLevel(levelJSON, 'default', parseComponent)
    for (const ent of newLevelComponents(v)) this.#zoo.default.add(ent)
    v.spriteByCard = new Map(
      [...V.zooQuery(this.#zoo.default, 'card & sprite')].map(ent => [
        ent.card,
        ent.sprite
      ])
    )
    this.cards = [...V.zooQuery(this.#zoo.default, 'card & sprite')]
    this.piles = [...V.zooQuery(this.#zoo.default, 'pile & sprite')]
    this.vacantStock = V.zooFindByID<VacantStockEnt>(
      this.#zoo.default,
      'VacantStock'
    )
    this.cursor = V.zooFindByID(this.#zoo.default, 'Cursor')
    this.#lvl = 'Init'
  }
}
