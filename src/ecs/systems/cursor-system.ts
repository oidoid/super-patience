import { Sprite } from '@/void'
import { SPAnimTag } from '../../assets/sp-anim-tag.ts'
import { Game } from '../../index.ts'
import { Layer } from '../../layer.ts'

export type CursorEnt = Readonly<
  { cursor: Record<never, never>; sprite: Sprite<SPAnimTag> }
>

export class CursorSystem {
  readonly query: (keyof CursorEnt)[] = ['cursor', 'sprite']
  run(ents: Iterable<CursorEnt>, game: Game): void {
    for (const ent of ents) {
      if (game.v.ctrl.isOnStart('A')) ent.sprite.tag = 'cursor--Pick'
      else if (game.v.ctrl.isOffStart('A')) ent.sprite.tag = 'cursor--Point'
      if (game.v.ctrl.point) {
        if (
          game.v.ctrl.pointType === 'pen' || game.v.ctrl.pointType === 'touch'
        ) ent.sprite.z = Layer.Hidden
        else ent.sprite.z = Layer.Cursor
      }
    }
  }
}
