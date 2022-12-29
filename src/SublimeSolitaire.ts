import { assertNonNull, I16, I16Box, I32, Random, U16XY, Uint } from '@/oidlib';
import { Solitaire } from '@/solitaire';
import {
  Assets,
  CardSystem,
  newLevelComponents,
  PatienceTheDemonSystem,
  PileHitboxSystem,
  SaveStorage,
  SpriteFactory,
  SublimeComponentSet,
  SublimeECSUpdate,
  TallySystem,
  VacantStockSystem,
} from '@/sublime-solitaire';
import {
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
  Viewport,
} from '@/void';

export interface SublimeSolitaire {
  readonly assets: Assets;
  readonly canvas: HTMLCanvasElement;
  readonly ecs: ECS<SublimeComponentSet, SublimeECSUpdate>;
  readonly input: Input;
  readonly solitaire: Solitaire;
  readonly minViewport: U16XY;
  readonly random: Random;
  readonly rendererStateMachine: RendererStateMachine;
  readonly saveStorage: SaveStorage;

  /** The total execution time in milliseconds excluding pauses. */
  age: number;
  /** The total frames rendered. */
  frames: Uint;
  tick: number;
  /** The outstanding time elapsed accrual to execute in milliseconds. */
  time: number;
  readonly instanceBuffer: InstanceBuffer;
  readonly cursor: Sprite;
}

export function SublimeSolitaire(
  window: Window,
  assets: Assets,
): SublimeSolitaire {
  const canvas = window.document.getElementsByTagName('canvas').item(0);
  assertNonNull(canvas, 'Canvas missing.');

  const random = Random(I32.mod(Date.now()));
  const saveStorage = SaveStorage.load(localStorage);
  const solitaire = Solitaire(undefined, () => Random.fraction(random));
  solitaire.wins = saveStorage.save.wins;

  const newRenderer = () =>
    Renderer(canvas, assets.atlas, assets.shaderLayout, assets.atlasMeta);

  const cardSystem = new CardSystem();
  const ecs = ECS<SublimeComponentSet, SublimeECSUpdate>(
    new Set([
      FollowCamSystem,
      CursorSystem, // Process first
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
    ) as SublimeComponentSet[], // to-do: fix types
  );
  ECS.flush(ecs);

  // to-do: allow systems to specify peripheral nonprocessing dependencies.
  cardSystem.piles = ECS.query(ecs, 'pile', 'sprite');
  cardSystem.vacantStock = ECS.query(ecs, 'vacantStock', 'sprite')?.[0]?.sprite;

  const tick = 1000 / 60;

  const self: SublimeSolitaire = {
    assets,
    canvas,
    random,
    instanceBuffer: InstanceBuffer(assets.shaderLayout),
    solitaire,
    ecs,
    input: new Input(),
    rendererStateMachine: new RendererStateMachine({
      window,
      canvas,
      onFrame: (delta) => SublimeSolitaire.onFrame(self, delta),
      onPause: () => {
        self.input.reset();
      },
      newRenderer,
    }),
    age: 0,
    tick,
    time: 0,
    frames: Uint(0),
    minViewport: U16XY(256, 214), // y = 2 (border) + 71 (offset) + 8 * 7 (initial stack with a king on top) + 11 * 7 (Q-2) + (A) 32 - (dont care) 24 = 214
    saveStorage,
    cursor: ECS.query(ecs, 'cursor', 'sprite')![0]!.sprite, // this api sucks
  };
  return self;
}

export namespace SublimeSolitaire {
  export async function make(window: Window): Promise<SublimeSolitaire> {
    const assets = await Assets.load();
    return SublimeSolitaire(window, assets);
  }

  export function start(self: SublimeSolitaire): void {
    self.input.register('add');
    self.rendererStateMachine.start();
  }

  export function stop(self: SublimeSolitaire): void {
    self.input.register('remove');
    self.rendererStateMachine.stop();
    // win.close()
  }

  export function onFrame(self: SublimeSolitaire, delta: number): void {
    const clientViewportWH = Viewport.clientViewportWH(window);
    const nativeViewportWH = Viewport.nativeViewportWH(
      window,
      clientViewportWH,
    );
    const scale = Viewport.scale(nativeViewportWH, self.minViewport, I16(0));
    const camWH = Viewport.camWH(nativeViewportWH, scale);
    const camBounds = I16Box(0, 0, camWH.x, camWH.y);
    self.time = self.time + delta; // Add elapsed time to the pending delta total.
    self.age = self.age + self.time - (self.time % self.tick); // Add delta less remainder.
    self.frames = Uint(self.frames + 1);

    // if (self.time % 1000 < 16) console.log(self.frames * 1000 / self.time);

    const update: SublimeECSUpdate = {
      filmByID: self.assets.atlasMeta.filmByID,
      camBounds,
      nativeViewportWH,
      clientViewportWH,
      ecs: self.ecs,
      delta,
      input: self.input,
      time: self.time,
      scale,
      saveStorage: self.saveStorage,
      instanceBuffer: self.instanceBuffer,
      rendererStateMachine: self.rendererStateMachine,
      solitaire: self.solitaire,
      cursor: self.cursor,
    };

    self.input.preupdate();

    processDebugInput(self, update);

    ECS.update(self.ecs, update);

    // should actual render be here and not in the ecs?
    self.input.postupdate(delta, clientViewportWH, camBounds);
  }
}

function processDebugInput(
  self: SublimeSolitaire,
  update: SublimeECSUpdate,
): void {
  if (update.pickHandled) return;
  if (
    self.input.isComboStart(
      ['Up'],
      ['Up'],
      ['Down'],
      ['Down'],
      ['Left'],
      ['Right'],
      ['Left'],
      ['Right'],
      ['Menu'],
      ['Action'],
    )
  ) {
    update.pickHandled = true;
    console.log('combo');
  }
  if (self.input.isOnStart('DebugContextLoss')) {
    if (!self.rendererStateMachine.isContextLost()) {
      update.pickHandled = true;
      self.rendererStateMachine.loseContext();
      setTimeout(
        () => self.rendererStateMachine.restoreContext(),
        3000,
      );
    }
  }
}
