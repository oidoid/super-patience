import { FilmByID } from '@/atlas-pack';
import { Solitaire } from '@/solitaire';
import {
  SaveStorage,
  SublimeComponentSet,
  SublimeFilmID,
} from '@/sublime-solitaire';
import { ECS, ECSUpdate, Sprite } from '@/void';

export interface SublimeECSUpdate extends ECSUpdate {
  readonly filmByID: FilmByID<SublimeFilmID>;
  readonly cursor: Sprite;
  readonly solitaire: Solitaire;
  readonly saveStorage: SaveStorage;
  readonly ecs: ECS<SublimeComponentSet, SublimeECSUpdate>;
}
