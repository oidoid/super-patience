import { Sprite } from '@/void'
import { Game } from '../../index.ts'

export type FollowPointEnt = Readonly<
  { followPoint: Record<never, never>; sprite: Sprite }
>

export class FollowPointSystem {
  readonly query: (keyof FollowPointEnt)[] = ['followPoint', 'sprite']
  run(ents: Iterable<FollowPointEnt>, game: Game): void {
    if (game.v.ctrl.point == null) return
    for (const ent of ents) ent.sprite.xy = game.v.ctrl.point
  }
}
