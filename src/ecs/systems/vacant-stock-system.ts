import {Sprite} from '@oidoid/void'
import {solitaireDeal} from 'klondike-solitaire'
import type {Tag} from '../../config.js'
import {type Game} from '../../index.js'
import {invalidateSolitaireSprites} from '../../level/level.js'

export type VacantStockEnt = {
  readonly vacantStock: object
  readonly sprite: Sprite<Tag>
}

export class VacantStockSystem {
  readonly query: (keyof VacantStockEnt)[] = ['vacantStock', 'sprite']
  run(ents: Iterable<VacantStockEnt>, game: Game) {
    if (game.v.ctrl.handled || !game.v.ctrl.isOffStart('A')) return
    for (const ent of ents) {
      if (!ent.sprite.hits(game.cursor)) return
      game.v.ctrl.handled = true
      solitaireDeal(game.solitaire)
      invalidateSolitaireSprites(game)
      return
    }
  }
}
