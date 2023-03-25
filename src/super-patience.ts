import { assertNonNull, I16, I32, Random, U16XY } from '@/ooz'
import { Solitaire } from '@/solitaire'
import {
  CardSystem,
  newLevelComponents,
  PatienceTheDemonSystem,
  PileHitboxSystem,
  SaveStorage,
  SPAssets,
  SPEnt,
  SPFilmID,
  SpriteFactory,
  TallySystem,
  VacantStockSystem,
} from '@/super-patience'
import {
  Assets,
  Cam,
  CursorSystem,
  ECS,
  FollowCamSystem,
  FollowPointSystem,
  Game,
  Input,
  RendererStateMachine,
  RenderSystem,
  Sprite,
} from '@/void'

export interface SuperPatience extends Game<SPEnt, SPFilmID> {
  readonly assets: Assets<SPFilmID>
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

  const random = new Random(I32.mod(Date.now()))
  const saveStorage = SaveStorage.load(localStorage)
  const solitaire = Solitaire(() => random.fraction(), saveStorage.save.wins)

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
    new CursorSystem(),
    new FollowPointSystem(),
    new CardSystem(
      [...ecs.query('pile & sprite')],
      ecs.queryOne('vacantStock & sprite').sprite,
    ),
    new PileHitboxSystem(),
    new VacantStockSystem(),
    new PatienceTheDemonSystem(),
    new TallySystem(),
    new RenderSystem<SPEnt>(assets.shaderLayout),
  )

  // y = 2 (border) + 71 (offset) + 8 * 7 (initial stack with a king on top) + 11 * 7 (Q-2) + (A) 32 - (dont care) 24 = 214
  const cam = new Cam(new U16XY(256, 214), window)

  const self: SuperPatience = {
    assets,
    cam,
    canvas,
    random: () => random.fraction(),
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
      onFrame: (delta) => SuperPatience.onFrame(self, delta),
      onPause: () => self.input.reset(),
    }),
    tick: 1,
    time: 0,
    saveStorage,
    cursor: ecs.queryOne('cursor & sprite').sprite,
    filmByID: assets.atlasMeta.filmByID,
    window,
  }
  return self
}

export namespace SuperPatience {
  export async function make(window: Window): Promise<SuperPatience> {
    return SuperPatience(window, await SPAssets.load())
  }

  export function start(self: SuperPatience): void {
    self.input.register('add')
    self.renderer.start()
  }

  export function stop(self: SuperPatience): void {
    self.input.register('remove')
    self.renderer.stop()
  }

  export function onFrame(self: SuperPatience, delta: number): void {
    self.tick = delta
    self.time += delta
    self.pickHandled = false

    self.input.preupdate()

    self.cam.resize()
    centerCam(self.cam)

    self.ecs.run(self)

    self.input.postupdate(self.tick)
  }
}

function centerCam(cam: Readonly<Cam>): void {
  const camOffsetX = Math.trunc((cam.viewport.w - cam.minViewport.x) / 2)
  cam.viewport.x = I16(-camOffsetX + camOffsetX % 8)
}
