import { assertNonNull, I16, I32, Random } from '@/ooz'
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
  CamSystem,
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
}

export function SuperPatience(
  window: Window,
  assets: Assets<SPFilmID>,
): SuperPatience {
  const canvas = window.document.getElementsByTagName('canvas').item(0)
  assertNonNull(canvas, 'Canvas missing.')

  const random = new Random(I32.mod(Date.now()))
  const saveStorage = SaveStorage.load(localStorage)
  const solitaire = Solitaire(
    undefined,
    () => random.fraction(),
    saveStorage.save.wins,
  )

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
    new CamSystem(centerCam),
    new FollowCamSystem(),
    new CursorSystem(),
    new FollowPointSystem(),
    new CardSystem(
      ecs.query('pile & sprite'),
      ecs.queryOne('vacantStock & sprite').sprite,
    ),
    new PileHitboxSystem(),
    new VacantStockSystem(),
    new PatienceTheDemonSystem(),
    new TallySystem(),
    new RenderSystem<SPEnt>(assets.shaderLayout),
  )

  const cam = ecs.queryOne('cam').cam
  const self: SuperPatience = {
    assets,
    cam,
    canvas,
    random: () => random.fraction(),
    solitaire,
    ecs,
    input: new Input(cam),
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
  }
  return self
}

export namespace SuperPatience {
  export async function make(window: Window): Promise<SuperPatience> {
    const assets = await SPAssets.load()
    return SuperPatience(window, assets)
  }

  export function start(self: SuperPatience): void {
    self.input.register('add')
    self.renderer.start()
  }

  export function stop(self: SuperPatience): void {
    self.input.register('remove')
    self.renderer.stop()
    // win.close()
  }

  export function onFrame(self: SuperPatience, delta: number): void {
    self.tick = delta
    self.time += delta
    self.pickHandled = false

    self.input.preupdate()

    self.ecs.run(self)

    // should actual render be here and not in the ecs?
    self.input.postupdate(self.tick)
  }
}

function centerCam(cam: Cam): void {
  const camOffsetX = Math.trunc((cam.viewport.w - cam.minViewport.x) / 2)
  cam.viewport.x = I16(-camOffsetX + camOffsetX % 8)
}
