import { assertNonNull, XY } from '@/ooz'
import { Solitaire } from '@/solitaire'
import {
  CardSystem,
  newLevelComponents,
  PatienceTheDemonSystem,
  PileHitboxSystem,
  SaveStorage,
  SPEnt,
  SPFilmID,
  SpriteFactory,
  TallySystem,
  VacantStockSystem,
} from '@/super-patience'
import {
  Assets,
  BitmapBuffer,
  Cam,
  CursorSystem,
  ECS,
  FollowCamSystem,
  FollowDpadSystem,
  FollowPointSystem,
  Game,
  Input,
  RendererStateMachine,
  Sprite,
} from '@/void'

export interface SuperPatience extends Game<SPEnt, SPFilmID> {
  readonly assets: Assets<SPFilmID>
  readonly bitmaps: BitmapBuffer
  readonly canvas: HTMLCanvasElement
  readonly cursor: Sprite
  readonly solitaire: Solitaire
  readonly saveStorage: SaveStorage
  tick: number
  time: number
  readonly window: Window
}

export function SuperPatience(
  window: Window,
  assets: Assets<SPFilmID>,
): SuperPatience {
  const canvas = window.document.getElementsByTagName('canvas').item(0)
  assertNonNull(canvas, 'Canvas missing.')

  const random = Math.random
  const saveStorage = SaveStorage.load(localStorage)
  const solitaire = Solitaire(random, saveStorage.data.wins)

  const ecs = new ECS<SPEnt>()
  ecs.addEnt(
    ...newLevelComponents(
      new SpriteFactory(assets.atlasMeta.filmByID),
      undefined,
      solitaire,
    ),
  )
  ecs.patch()
  ecs.addSystem(
    new FollowCamSystem(),
    new CursorSystem(true),
    new FollowDpadSystem(),
    new FollowPointSystem(),
    new CardSystem(
      [...ecs.query('pile & sprites')],
      ecs.queryOne('vacantStock & sprites').sprites[0],
    ),
    new PileHitboxSystem(),
    new VacantStockSystem(),
    new PatienceTheDemonSystem(),
    new TallySystem(),
  )

  // y = 2 (border) + 71 (offset) + 8 * 7 (initial stack with a king on top) + 11 * 7 (Q-2) + (A) 32 - (dont care) 24 = 214
  const cam = new Cam(new XY(256, 214), window)

  const self: SuperPatience = {
    assets,
    bitmaps: new BitmapBuffer(assets.shaderLayout),
    cam,
    canvas,
    random,
    solitaire,
    ecs,
    input: new Input(
      cam,
      window.navigator,
      window,
      window.document,
      canvas,
      window,
    ),
    renderer: new RendererStateMachine({
      assets,
      window,
      canvas,
      onFrame: (delta) => spOnFrame(self, delta),
      onPause: () => self.input.reset(),
    }),
    tick: 1,
    time: 0,
    saveStorage,
    cursor: ecs.queryOne('cursor & sprites').sprites[0],
    filmByID: assets.atlasMeta.filmByID,
    window,
  }
  return self
}

export function spStart(self: SuperPatience): void {
  self.input.register('add')
  self.renderer.start()
}

export function spStop(self: SuperPatience): void {
  self.input.register('remove')
  self.renderer.stop()
}

function spOnFrame(self: SuperPatience, delta: number): void {
  self.tick = delta
  self.time += delta
  self.pickHandled = false

  self.input.preupdate()

  self.cam.resize()
  centerCam(self.cam)

  self.ecs.run(self)

  // to-do: rework.
  // so this works well but it's hard to get notified of new sprites being
  // made and old removed. for grid, how can i make sure that moved sprites
  // get invalidated. is there a big sprite movement mgmt system?
  let index = 0
  for (const ent of self.ecs.query('sprites')) {
    for (const sprite of ent.sprites) {
      self.bitmaps.set(index, sprite, self.time)
      index++
    }
  }

  self.renderer.render(self.time, self.cam, self.bitmaps)

  self.input.postupdate(self.tick)
}

function centerCam(cam: Readonly<Cam>): void {
  const camOffsetX = Math.trunc((cam.viewport.w - cam.minViewport.x) / 2)
  cam.viewport.x = -camOffsetX + camOffsetX % 8
}
