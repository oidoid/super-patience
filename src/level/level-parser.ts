import {Sprite, type Atlas, type SpriteJSON} from '@oidoid/void'
import type {SPAnimTag} from '../assets/sp-anim-tag.js'
import type {FollowCamConfig} from '../ecs/components/follow-cam.js'
import type {Ent} from '../ecs/ent.js'
import {Layer} from '../layer.js'
import levelJSON from './level.json' with {type: 'json'}

export function parseLevel(atlas: Atlas<SPAnimTag>): Partial<Ent>[] {
  return levelJSON.map(json => parseComponentSet(atlas, json))
}

function parseComponentSet(
  atlas: Atlas<SPAnimTag>,
  json: unknown
): Partial<Ent> {
  const set: Partial<{-readonly [Key in keyof Ent]: Ent[Key]}> = {}
  for (const [key, val] of Object.entries(<object>json)) {
    switch (
      key // to-do: fail when missing types.
    ) {
      case 'cursor':
        set[key] = {}
        break
      case 'followCam':
        set[key] = <FollowCamConfig>val
        break
      case 'followPoint':
        set[key] = {}
        break
      case 'patienceTheDemon':
        set[key] = {}
        break
      case 'pile': {
        const type = (<{type: string}>val).type
        if (type !== 'Waste') throw Error(`unsupported pile type "${type}"`)
        set[key] = {type: 'Waste'}
        break
      }
      case 'sprite': {
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
