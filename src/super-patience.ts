import { assertNonNull, I32, NonNull, Random } from '@/oidlib';
import { Solitaire } from '@/solitaire';
import {
  Assets,
  CardSystem,
  newLevelComponents,
  PatienceTheDemonSystem,
  PileHitboxSystem,
  SaveStorage,
  SPComponentSet,
  SPECSUpdate,
  SpriteFactory,
  TallySystem,
  VacantStockSystem,
} from '@/super-patience';
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
  Sprite,
} from '@/void';

export interface SuperPatience extends SPECSUpdate {
  readonly assets: Assets;
  readonly canvas: HTMLCanvasElement;
  readonly cam: Cam;
  readonly ecs: ECS<SPComponentSet, SPECSUpdate>;
  readonly input: Input;
  readonly solitaire: Solitaire;
  readonly random: Random;
  readonly rendererStateMachine: RendererStateMachine;
  readonly saveStorage: SaveStorage;
  /** The total number of ticks completed. ticks * tick = age. */
  ticks: number;
  /** The running age in milliseconds excluding unprocessed delta. */
  time: number;
  /**
   * The exact duration in milliseconds to apply each update. Any number of
   * updates may occur per animation frame.
   */
  tick: number;
  /** The outstanding time elapsed accrual to execute in milliseconds. */
  delta: number;
  readonly instanceBuffer: InstanceBuffer;
  readonly cursor: Sprite;
}

export function SuperPatience(
  window: Window,
  assets: Assets,
): SuperPatience {
  const canvas = window.document.getElementsByTagName('canvas').item(0);
  assertNonNull(canvas, 'Canvas missing.');

  const random = Random(I32.mod(Date.now()));
  const saveStorage = SaveStorage.load(localStorage);
  const solitaire = Solitaire(
    undefined,
    () => Random.fraction(random),
    saveStorage.save.wins,
  );

  const newRenderer = () =>
    Renderer(canvas, assets.atlas, assets.shaderLayout, assets.atlasMeta);

  const cardSystem = new CardSystem();
  const ecs = ECS<SPComponentSet, SPECSUpdate>(
    new Set([
      CamSystem,
      FollowCamSystem,
      new CursorSystem(), // Process first
      FollowPointSystem,
      cardSystem,
      PileHitboxSystem,
      VacantStockSystem,
      PatienceTheDemonSystem,
      TallySystem,
      RenderSystem, // Last
    ]),
  );
  ECS.addEnt(
    ecs,
    ...newLevelComponents(
      new SpriteFactory(assets.atlasMeta.filmByID),
      solitaire,
    ) as SPComponentSet[], // to-do: fix types
  );
  ECS.flush(ecs);

  // to-do: allow systems to specify peripheral nonprocessing dependencies.
  cardSystem.piles = ECS.query(ecs, 'pile', 'sprite');
  cardSystem.vacantStock = ECS.query(ecs, 'vacantStock', 'sprite')?.[0]?.sprite;

  const tick = 1000 / 60;

  const cam = NonNull(ECS.query(ecs, 'cam')[0], 'Missing cam entity.').cam;
  const self: SuperPatience = {
    assets,
    cam,
    canvas,
    random,
    instanceBuffer: InstanceBuffer(assets.shaderLayout),
    solitaire,
    ecs,
    input: new Input(cam),
    rendererStateMachine: new RendererStateMachine({
      window,
      canvas,
      onFrame: (delta) => SuperPatience.onFrame(self, delta),
      onPause: () => {
        self.input.reset();
      },
      newRenderer,
    }),
    tick,
    ticks: 0,
    delta: 0,
    get time() {
      return this.tick * this.ticks;
    },
    saveStorage,
    cursor: ECS.query(ecs, 'cursor', 'sprite')![0]!.sprite, // this api sucks

    filmByID: assets.atlasMeta.filmByID,
  };
  return self;
}

export namespace SuperPatience {
  export async function make(window: Window): Promise<SuperPatience> {
    const assets = await Assets.load();
    return SuperPatience(window, assets);
  }

  export function start(self: SuperPatience): void {
    self.input.register('add');
    self.rendererStateMachine.start();
  }

  export function stop(self: SuperPatience): void {
    self.input.register('remove');
    self.rendererStateMachine.stop();
    // win.close()
  }

  export function onFrame(self: SuperPatience, delta: number): void {
    // Add elapsed time to the pending delta total.
    self.delta += delta;

    while (self.delta >= self.tick) {
      self.delta -= self.tick;
      self.pickHandled = false;

      self.input.preupdate();

      ECS.update(self.ecs, self);

      // should actual render be here and not in the ecs?
      self.input.postupdate(self.tick);

      self.ticks++;
    }
  }
}
