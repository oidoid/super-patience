import {
  assertNonNull,
  I16,
  I16Box,
  I32,
  Random,
  U16XY,
  Uint,
  UnumberMillis,
} from '@/oidlib';
import { Solitaire } from '@/solitaire';
import {
  Assets,
  CardSystem,
  newLevelComponents,
  PatienceTheDemonSystem,
  PickState,
  PileConfig,
  PileHitboxSystem,
  SaveStorage,
  SpriteFactory,
  SublimeSet,
  SublimeUpdate,
  TallySystem,
  VacantStockSystem,
} from '@/sublime-solitaire';
import {
  Button,
  CursorSystem,
  ECS,
  FollowCamSystem,
  FollowPointSystem,
  Input,
  InputPoller,
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
  readonly ecs: ECS<SublimeSet, SublimeUpdate>;
  readonly inputPoller: InputPoller;
  readonly solitaire: Solitaire;
  readonly minViewport: U16XY;
  readonly random: Random;
  readonly rendererStateMachine: RendererStateMachine;
  readonly saveStorage: SaveStorage;

  /** The total execution time in milliseconds excluding pauses. */
  age: UnumberMillis;
  /** The total frames rendered. */
  frames: Uint;
  tick: UnumberMillis;
  /** The outstanding time elapsed accrual to execute in milliseconds. */
  time: UnumberMillis;
  picked: PickState | undefined;
  readonly instanceBuffer: InstanceBuffer;
  readonly piles: readonly Readonly<{ pile: PileConfig; sprite: Sprite }>[];
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

  const ecs = ECS<SublimeSet, SublimeUpdate>(
    new Set([
      FollowCamSystem,
      CursorSystem, // Process first
      FollowPointSystem,
      CardSystem,
      PileHitboxSystem,
      VacantStockSystem,
      PatienceTheDemonSystem,
      TallySystem,
      RenderSystem,
    ]),
  );
  ECS.addEnt(
    ecs,
    ...newLevelComponents(
      new SpriteFactory(assets.atlasMeta.filmByID),
      solitaire,
    ) as SublimeSet[], // to-do: fix types
  );
  ECS.flush(ecs);

  const self: SublimeSolitaire = {
    assets,
    canvas,
    random,
    instanceBuffer: InstanceBuffer(assets.shaderLayout),
    picked: undefined,
    solitaire,
    ecs,
    inputPoller: InputPoller.make(),
    rendererStateMachine: RendererStateMachine.make({
      window,
      canvas,
      onFrame: (delta) => SublimeSolitaire.onFrame(self, delta),
      onPause: () => {},
      newRenderer,
    }),
    age: UnumberMillis(0),
    tick: UnumberMillis(1000 / 60),
    time: UnumberMillis(0),
    frames: Uint(0),
    minViewport: U16XY(248, 214), // y = 2 (border) + 71 (offset) + 8 * 7 (initial stack with a king on top) + 11 * 7 (Q-2) + (A) 32 - (dont care) 24 = 214
    saveStorage,
    cursor: ECS.query(ecs, 'cursor', 'sprite')![0]!.sprite, // this api sucks
    piles: ECS.query(ecs, 'pile', 'sprite'),
  };
  return self;
}

export namespace SublimeSolitaire {
  export async function make(window: Window): Promise<SublimeSolitaire> {
    const assets = await Assets.load();
    return SublimeSolitaire(window, assets);
  }

  export function start(self: SublimeSolitaire): void {
    InputPoller.register(self.inputPoller, window, 'add');
    RendererStateMachine.start(self.rendererStateMachine);
  }

  export function onFrame(self: SublimeSolitaire, delta: UnumberMillis): void {
    const clientViewportWH = Viewport.clientViewportWH(window);
    const nativeViewportWH = Viewport.nativeViewportWH(
      window,
      clientViewportWH,
    );
    const scale = Viewport.scale(nativeViewportWH, self.minViewport, I16(0));
    const camWH = Viewport.camWH(nativeViewportWH, scale);
    const camBounds = I16Box(0, 0, camWH.x, camWH.y);
    self.time = UnumberMillis(self.time + delta); // Add elapsed time to the pending delta total.
    self.age = UnumberMillis(self.age + self.time - (self.time % self.tick)); // Add delta less remainder.
    self.frames = Uint(self.frames + 1);

    // if (self.time % 1000 < 16) console.log(self.frames * 1000 / self.time);

    const update: SublimeUpdate = {
      filmByID: self.assets.atlasMeta.filmByID,
      camBounds,
      nativeViewportWH,
      clientViewportWH,
      ecs: self.ecs,
      delta,
      inputs: self.inputPoller.inputs,
      picked: self.picked,
      time: self.time,
      scale,
      saveStorage: self.saveStorage,
      instanceBuffer: self.instanceBuffer,
      rendererStateMachine: self.rendererStateMachine,
      solitaire: self.solitaire,
      piles: self.piles,
      cursor: self.cursor,
    };

    ECS.update(self.ecs, update);
    self.picked = update.picked;
    InputPoller.update(self.inputPoller, delta, clientViewportWH, camBounds);
    // should actual render be here and not in the ecs?

    if (
      Input.activeTriggered(self.inputPoller.inputs.pick) &&
      ((self.inputPoller.inputs.pick?.buttons ?? 0) & Button.Secondary) ==
        Button.Secondary
    ) {
      if (!self.rendererStateMachine.renderer.gl.isContextLost()) {
        self.rendererStateMachine.renderer.loseContext?.loseContext();
        setTimeout(
          () =>
            self.rendererStateMachine.renderer.loseContext?.restoreContext(),
          5000,
        );
      }
    }
  }
}
