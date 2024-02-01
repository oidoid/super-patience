import { Atlas, Sprite, SpriteJSON } from '@/void'
import { SPAnimTag } from '../assets/sp-anim-tag.ts'
import { FollowCamConfig } from '../ecs/components/follow-cam.ts'
import { Ent } from '../ecs/ent.ts'
import { Layer } from '../layer.ts'
import levelJSON from './level.json' with { type: 'json' }

export function parseLevel(atlas: Atlas<SPAnimTag>): Partial<Ent>[] {
  return levelJSON.map((json) => parseComponentSet(atlas, json))
}

function parseComponentSet(
  atlas: Atlas<SPAnimTag>,
  json: unknown,
): Partial<Ent> {
  const set: Partial<Record<keyof Ent, Ent[keyof Ent]>> = {}
  for (const [key, val] of Object.entries(json as Record<string, unknown>)) {
    switch (key) { // to-do: fail when missing types.
      case 'cursor':
        set[key] = {}
        break
      case 'followCam':
        set[key] = val as FollowCamConfig
        break
      case 'followPoint':
        set[key] = {}
        break
      case 'patienceTheDemon':
        set[key] = {}
        break
      case 'pile': {
        const type = (val as { type: string }).type
        if (type !== 'Waste') throw Error(`unsupported pile type "${type}"`)
        set[key] = { type: 'Waste' }
        break
      }
      case 'sprite': {
        const sprite = Sprite.parse(atlas, val as SpriteJSON)
        sprite.z = Layer[(val as { layer: Layer }).layer]
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
  return set as Ent
}
