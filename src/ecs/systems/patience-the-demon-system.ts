import { solitaireReset } from '@/solitaire'
import { Sprite } from '@/void'
import { SPAnimTag } from '../../assets/sp-anim-tag.ts'
import { Game } from '../../index.ts'
import { SaveData, saveKey } from '../../save-data.ts'

export type PatienceTheDemonEnt = Readonly<
  { patienceTheDemon: Record<never, never>; sprite: Sprite<SPAnimTag> }
>

export class PatienceTheDemonSystem {
  readonly query: (keyof PatienceTheDemonEnt)[] = ['patienceTheDemon', 'sprite']
  run(ents: Iterable<PatienceTheDemonEnt>, game: Game): void {
    for (const ent of ents) {
      const blink = (game.v.frame % (60 * 60)) < 18 ? 'Blink' : ''
      const good = ent.sprite.tag.includes('Good')
      ent.sprite.tag = `patience-the-demon--${good ? 'Good' : 'Evil'}${blink}`
      if (game.v.ctrl.handled || !game.v.ctrl.isOffStart('A')) return
      if (game.cursor.hits(ent.sprite)) { // Tail.
        game.v.ctrl.handled = true
        ent.sprite.tag = `patience-the-demon--${good ? 'Evil' : 'Good'}${blink}`
      } else if (
        game.cursor.hits({
          x: ent.sprite.x,
          y: ent.sprite.y,
          w: ent.sprite.w,
          h: ent.sprite.h,
        })
      ) { // Anywhere else.
        game.v.ctrl.handled = true
        solitaireReset(game.solitaire)
        game.v.kv.put<SaveData>(saveKey, { wins: game.solitaire.wins })
      }
    }
  }
}
