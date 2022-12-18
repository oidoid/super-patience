import { FilmByID } from '@/atlas-pack';
import { I16XY } from '@/oidlib';
import { Card, Solitaire } from '@/solitaire';
import {
  PileConfig,
  SaveStorage,
  SublimeFilmID,
  TallyConfig,
} from '@/sublime-solitaire';
import { CursorFilmSet, ECS, ECSUpdate, FollowCamConfig, Sprite } from '@/void';

export interface SublimeSet {
  readonly cursor: CursorFilmSet;
  readonly card: Card;
  readonly followCam: FollowCamConfig;
  readonly followPoint: Record<never, never>;
  readonly sprite: Sprite;
  readonly pile: PileConfig;
  readonly patienceTheDemon: Record<never, never>;
  readonly vacantStock: Record<never, never>;
  readonly tally: TallyConfig;
}

export interface SublimeUpdate extends ECSUpdate {
  readonly filmByID: FilmByID<SublimeFilmID>;
  cursor: Sprite;
  picked: PickState | undefined;
  readonly piles: readonly { pile: PileConfig; sprite: Sprite }[];
  readonly solitaire: Solitaire;
  readonly saveStorage: SaveStorage;
  readonly ecs: ECS<SublimeSet, SublimeUpdate>;
}

export interface PickState {
  readonly ents: {
    readonly components: Partial<SublimeSet>;
    /** The adjustment to offset future pick inputs by. */
    readonly offset: Readonly<I16XY>;
  }[];
}
