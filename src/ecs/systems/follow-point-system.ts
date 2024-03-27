import {Sprite} from '@oidoid/void'
import type {SPAnimTag} from '../../assets/sp-anim-tag.js'
import {type Game} from '../../index.js'

export type FollowPointEnt = {
  readonly followPoint: object
  readonly sprite: Sprite<SPAnimTag>
}

export class FollowPointSystem {
  readonly query: (keyof FollowPointEnt)[] = ['followPoint', 'sprite']
  run(ents: Iterable<FollowPointEnt>, game: Game): void {
    if (game.v.ctrl.point == null) return
    for (const ent of ents) ent.sprite.xy = game.v.ctrl.point
  }
}
