import { assertNonNull, I16, I32, NonNull, Random } from '@/ooz'
import { Solitaire } from '@/solitaire'
import {
  Assets,
  CardSystem,
  newLevelComponents,
  PatienceTheDemonSystem,
  PileHitboxSystem,
  SaveStorage,
  SPEnt,
  SpriteFactory,
  SPRunState,
  TallySystem,
  VacantStockSystem,
} from '@/super-patience'
import {
  Cam,
  CamSystem,
  CursorSystem,
  ECS,
  FollowCamSystem,
  FollowPointSystem,
  Input,
  InstanceBuffer,
  Renderer,
  RendererStateMachine,
  RenderSystem,
} from '@/void'

export interface SuperPatience extends SPRunState {
  readonly assets: Assets
  readonly canvas: HTMLCanvasElement
  tick: number
  time: number
}

export function SuperPatience(window: Window, assets: Assets): SuperPatience {
  const canvas = window.document.getElementsByTagName('canvas').item(0)
  assertNonNull(canvas, 'Canvas missing.')

  const random = new Random(I32.mod(Date.now()))
  const saveStorage = SaveStorage.load(localStorage)
  const solitaire = Solitaire(
    undefined,
    () => random.fraction(),
    saveStorage.save.wins,
  )

  const newRenderer = () =>
    Renderer(canvas, assets.atlas, assets.shaderLayout, assets.atlasMeta)

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
      NonNull(
        ecs.query('vacantStock & sprite')?.[0]?.sprite,
        'Missing vacant stock entity.',
      ),
    ),
    new PileHitboxSystem(),
    new VacantStockSystem(),
    new PatienceTheDemonSystem(),
    new TallySystem(),
    new RenderSystem<SPEnt>(),
  )

  const cam = NonNull(ecs.query('cam')[0], 'Missing cam entity.').cam
  const self: SuperPatience = {
    assets,
    cam,
    canvas,
    random: () => random.fraction(),
    instanceBuffer: new InstanceBuffer(assets.shaderLayout),
    solitaire,
    ecs,
    input: new Input(cam),
    rendererStateMachine: new RendererStateMachine({
      window,
      canvas,
      onFrame: (delta) => SuperPatience.onFrame(self, delta),
      onPause: () => self.input.reset(),
      newRenderer,
    }),
    tick: 1,
    time: 0,
    saveStorage,
    cursor:
      NonNull(ecs.query('cursor & sprite')[0], 'Missing cursor entity.').sprite,
    filmByID: assets.atlasMeta.filmByID,
  }
  return self
}

export namespace SuperPatience {
  export async function make(window: Window): Promise<SuperPatience> {
    const assets = await Assets.load()
    return SuperPatience(window, assets)
  }

  export function start(self: SuperPatience): void {
    self.input.register('add')
    self.rendererStateMachine.start()
  }

  export function stop(self: SuperPatience): void {
    self.input.register('remove')
    self.rendererStateMachine.stop()
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
