import { FilmByID } from '@/atlas-pack';
import { Solitaire } from '@/solitaire';
import { SaveStorage, SPComponentSet, SPFilmID } from '@/super-patience';
import { ECS, ECSUpdate, Sprite } from '@/void';

export interface SPECSUpdate extends ECSUpdate {
  readonly filmByID: FilmByID<SPFilmID>;
  readonly cursor: Sprite;
  readonly solitaire: Solitaire;
  readonly saveStorage: SaveStorage;
  readonly ecs: ECS<SPComponentSet, SPECSUpdate>;
}
