import {Sprite} from '@oidoid/void'
import {solitaireReset} from 'klondike-solitaire'
import type {SPAnimTag} from '../../assets/sp-anim-tag.js'
import type {Game} from '../../index.js'
import {saveKey, type Save} from '../../save.js'

export type PatienceTheDemonEnt = {
  readonly patienceTheDemon: object
  readonly sprite: Sprite<SPAnimTag>
}

export class PatienceTheDemonSystem {
  readonly query: (keyof PatienceTheDemonEnt)[] = ['patienceTheDemon', 'sprite']
  run(ents: Iterable<PatienceTheDemonEnt>, game: Game): void {
    for (const ent of ents) {
      const blink = game.v.frame % (60 * 60) < 18 ? 'Blink' : ''
      const good = ent.sprite.tag.includes('Good')
      ent.sprite.tag = `patience-the-demon--${good ? 'Good' : 'Evil'}${blink}`
      if (game.v.ctrl.handled || !game.v.ctrl.isOffStart('A')) return
      if (game.cursor.hits(ent.sprite)) {
        // Tail.
        game.v.ctrl.handled = true
        ent.sprite.tag = `patience-the-demon--${good ? 'Evil' : 'Good'}${blink}`
      } else if (
        game.cursor.hits({
          x: ent.sprite.x,
          y: ent.sprite.y,
          w: ent.sprite.w,
          h: ent.sprite.h
        })
      ) {
        // Anywhere else.
        game.v.ctrl.handled = true
        solitaireReset(game.solitaire)
        game.v.kv.put<Save>(saveKey, {wins: game.solitaire.wins})
      }
    }
  }
}
