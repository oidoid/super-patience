import * as V from '@oidoid/void'
import {solitaireReset} from 'klondike-solitaire'
import {type Save, saveKey} from '../types/save.js'
import {invalidateSolitaireSprites} from '../level/level.js'

export type PatienceTheDemonEnt = V.SysEnt<PatienceTheDemonSystem>

export class PatienceTheDemonSystem implements V.Sys {
  readonly query = 'patienceTheDemon & sprite'
  update(ent: PatienceTheDemonEnt, v: V.Void): void {
    const millis = Date.now() % 60000
    const blink = millis < 59700 ? '' : 'Blink'
    const good = ent.sprite.tag.includes('Good')
    const align = v.input.isOffStart('A')
      ? good
        ? 'Evil'
        : 'Good'
      : good
        ? 'Good'
        : 'Evil'
    const tag = `patience-the-demon--${align}${blink}` as const
    if (ent.sprite.tag !== tag) {
      ent.sprite.tag = tag
      ent.invalid = true
    }
    if (!v.input.isOffStart('A')) return
    if (v.zoo.cursor?.sprite.hitsZ(ent.sprite, v.cam)) {
      // tail.
      v.input.handled = true
      ent.invalid = true
    } else if (v.zoo.cursor && ent.sprite.hitsZ(v.zoo.cursor.sprite, v.cam)) {
      // anywhere else.
      v.input.handled = true
      solitaireReset(v.solitaire)
      V.saveJSON<Save>(saveKey, {wins: v.solitaire.wins})
      invalidateSolitaireSprites(v)
    }
  }
}
