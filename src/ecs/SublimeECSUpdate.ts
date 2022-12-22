import { FilmByID } from '@/atlas-pack';
import { I16XY } from '@/oidlib';
import { Solitaire } from '@/solitaire';
import { PileConfig, SaveStorage, SublimeFilmID } from '@/sublime-solitaire';
import { ECS, ECSUpdate, Sprite } from '@/void';
import { ComponentSet } from './ComponentSet.ts';

export interface SublimeECSUpdate extends ECSUpdate {
  readonly filmByID: FilmByID<SublimeFilmID>;
  cursor: Sprite;
  picked: PickState | undefined;
  readonly piles: readonly { pile: PileConfig; sprite: Sprite }[];
  readonly solitaire: Solitaire;
  readonly saveStorage: SaveStorage;
  readonly ecs: ECS<ComponentSet, SublimeECSUpdate>;
}

export interface PickState {
  readonly ents: {
    readonly components: Partial<ComponentSet>;
    /** The adjustment to offset future pick inputs by. */
    readonly offset: Readonly<I16XY>;
  }[];
}
