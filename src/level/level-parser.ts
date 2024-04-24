import {Sprite, type Atlas, type SpriteJSON} from '@oidoid/void'
import type {Tag} from '../config.js'
import type {FollowCamConfig} from '../ecs/components/follow-cam.js'
import type {Ent} from '../ecs/ent.js'
import type {PileEnt} from '../ecs/systems/card-system.js'
import type {CursorEnt} from '../ecs/systems/cursor-system.js'
import type {FollowPointEnt} from '../ecs/systems/follow-point-system.js'
import type {PatienceTheDemonEnt} from '../ecs/systems/patience-the-demon-system.js'
import {Layer} from '../layer.js'
import levelJSON from './level.json' with {type: 'json'}

export function parseLevel(atlas: Atlas<Tag>): Partial<Ent>[] {
  return levelJSON.map(json => parseComponentSet(atlas, json))
}

function parseComponentSet(atlas: Atlas<Tag>, json: unknown): Partial<Ent> {
  const set: Partial<{-readonly [Key in keyof Ent]: Ent[Key]}> = {}
  for (const [key, val] of Object.entries(<object>json)) {
    switch (key) {
      case 'cursor' satisfies keyof Ent:
        set[key] = {} satisfies CursorEnt['cursor']
        break
      case 'followCam' satisfies keyof Ent:
        set[key] = <FollowCamConfig>val
        break
      case 'followPoint' satisfies keyof Ent:
        set[key] = {} satisfies FollowPointEnt['followPoint']
        break
      case 'patienceTheDemon' satisfies keyof Ent:
        set[key] = {} satisfies PatienceTheDemonEnt['patienceTheDemon']
        break
      case 'pile' satisfies keyof Ent: {
        const type = (<{type: string}>val).type
        if (type !== 'Waste') throw Error(`unsupported pile type "${type}"`)
        set[key] = {type: 'Waste'} satisfies PileEnt['pile']
        break
      }
      case 'sprite' satisfies keyof Ent: {
        const sprite = Sprite.parse(atlas, <SpriteJSON>val)
        sprite.z = Layer[(<{layer: Layer}>val).layer]
        set[key] = sprite
        break
      }
      case '//':
      case 'name':
        break
      default:
        throw Error(`unsupported level config type "${key}"`)
    }
  }
  return <Ent>set
}
