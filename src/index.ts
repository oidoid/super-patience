import { Card, Solitaire } from '@/solitaire'
import { Sprite, Void } from '@/void'
import config from '../deno.json' assert { type: 'json' }
import { SPAnimTag } from './assets/sp-anim-tag.ts'
import { Ent } from './ecs/ent.ts'
import { CardSystem, PileEnt } from './ecs/systems/card-system.ts'
import { CursorSystem } from './ecs/systems/cursor-system.ts'
import { FollowCamSystem } from './ecs/systems/follow-cam-system.ts'
import { FollowPointSystem } from './ecs/systems/follow-point-system.ts'
import { PatienceTheDemonSystem } from './ecs/systems/patience-the-demon-system.ts'
import { PileHitboxSystem } from './ecs/systems/pile-hitbox-system.ts'
import { TallySystem } from './ecs/systems/tally-system.ts'
import { VacantStockSystem } from './ecs/systems/vacant-stock-system.ts'
import { newLevelComponents } from './level/ent-factory.ts'
import { SaveData, saveKey } from './save-data.ts'

export type Game = {
  readonly v: Void<SPAnimTag>
  readonly cursor: Sprite
  readonly solitaire: Solitaire
  readonly spriteByCard: Map<Card, Sprite>
}

console.log(`Super Patience v${config.version} by oidoid`)

const v = await Void.new<SPAnimTag>()
v.background = 0x0a1a1aff
v.cam.minWH.w = 256
// y = 2 (border) + 71 (offset) + 8 * 7 (initial stack with a king on top) + 11 * 7 (Q-2) + (A) 32 - (dont care) 24 = 214
v.cam.minWH.h = 214
v.ctrl.mapStandard()

const save = v.kv.get<SaveData>(saveKey) ?? { wins: 0 }
const solitaire = Solitaire(Math.random, save.wins)

const ents = [...newLevelComponents(v, solitaire)]
const systems = [
  new FollowCamSystem(),
  new CursorSystem(),
  new FollowPointSystem(),
  new CardSystem(
    filter(ents, 'pile', 'sprite') as PileEnt[],
    filter(ents, 'vacantStock', 'sprite')[0]!.sprite!,
  ),
  new PileHitboxSystem(),
  new VacantStockSystem(),
  new PatienceTheDemonSystem(),
  new TallySystem(),
]

// gotta make 512px wide sprites for background
const game: Game = {
  v,
  solitaire,
  cursor: filter(ents, 'cursor', 'sprite')[0]!.sprite!,
  spriteByCard: new Map(
    filter(ents, 'card', 'sprite').map((ent) => [ent.card!, ent.sprite!]),
  ),
}
game.v.render(loop)

function loop(): void {
  const camOffsetX = Math.trunc((v.cam.w - v.cam.minWH.w) / 2)
  v.cam.x = -camOffsetX + camOffsetX % 8

  for (const system of systems) {
    // deno-lint-ignore no-extra-semi
    ;(system as { run(ents: Iterable<Partial<Ent>>, game: Game): void }).run(
      filter(ents, ...system.query),
      game,
    )
  }

  for (const ent of ents) if (ent.sprite) v.blit(ent.sprite)
  game.v.render(loop)
}

function filter(ents: Partial<Ent>[], ...keys: (keyof Ent)[]): Partial<Ent>[] {
  return ents.filter((ent) => keys.every((key) => ent[key] != null))
}
