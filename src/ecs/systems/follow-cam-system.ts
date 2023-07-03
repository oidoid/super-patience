import { Box, Sprite } from '@/void'
import { Game } from '../../index.ts'
import { FollowCamConfig } from '../components/follow-cam.ts'

export type FollowCamEnt = Readonly<
  { followCam: FollowCamConfig; sprite: Sprite }
>

export class FollowCamSystem {
  readonly query: (keyof FollowCamEnt)[] = ['followCam', 'sprite']
  run(ents: Iterable<FollowCamEnt>, game: Game): void {
    for (const ent of ents) {
      const { followCam, sprite } = ent
      const pad = { x: followCam.pad?.x ?? 0, y: followCam.pad?.y ?? 0 }
      if (followCam.fill === 'X' || followCam.fill === 'XY') {
        sprite.w = game.v.cam.w - pad.x * 2
      }
      if (followCam.fill === 'Y' || followCam.fill === 'XY') {
        sprite.h = game.v.cam.h - pad.y * 2
      }
      sprite.x = computeX(sprite, game.v.cam, followCam)
      sprite.y = computeY(sprite, game.v.cam, followCam)
    }
  }
}

function computeX(
  sprite: Readonly<Sprite>,
  cam: Readonly<Box>,
  component: Readonly<FollowCamConfig>,
): number {
  const padW = component.pad?.x ?? 0
  let x = cam.x
  switch (component.orientation) {
    case 'Southwest':
    case 'West':
    case 'Northwest':
      x += padW
      break
    case 'Southeast':
    case 'East':
    case 'Northeast':
      x += cam.w - (sprite.w + padW)
      break
    case 'North':
    case 'South':
    case 'Center':
      x += Math.trunc(cam.w / 2) - (Math.trunc(sprite.w / 2) + padW)
      break
  }
  const modulo = (component.modulo?.x ?? x) || 1
  return x - x % modulo
}

function computeY(
  sprite: Readonly<Sprite>,
  cam: Readonly<Box>,
  component: Readonly<FollowCamConfig>,
): number {
  const padH = component.pad?.y ?? 0
  let y = cam.y
  switch (component.orientation) {
    case 'North':
    case 'Northeast':
    case 'Northwest':
      y += padH
      break
    case 'Southeast':
    case 'South':
    case 'Southwest':
      y += cam.h - (sprite.h + padH)
      break
    case 'East':
    case 'West':
    case 'Center':
      y += Math.trunc(cam.h / 2) - (Math.trunc(sprite.h / 2) + padH)
      break
  }
  const modulo = (component.modulo?.y ?? y) || 1
  return y - y % modulo
}
