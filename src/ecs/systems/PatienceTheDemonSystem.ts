import { Film } from '@/atlas-pack';
import { Immutable } from '@/oidlib';
import { Solitaire } from '@/solitaire';
import { Sprite, System } from '@/void';
import { SaveStorage } from '../../storage/SaveStorage.ts';
import { SublimeECSUpdate } from '../SublimeECSUpdate.ts';

export interface PatienceTheDemonSet {
  readonly patienceTheDemon: Record<never, never>;
  readonly sprite: Sprite;
}

export const PatienceTheDemonSystem: System<
  PatienceTheDemonSet,
  SublimeECSUpdate
> = Immutable({
  query: new Set(['patienceTheDemon', 'sprite']),
  skip(update) {
    if (update.pickHandled) return true;
    // to-do: need notion of handled state so that picks don't bleed.
    // to-do: need notion of system order so that pickable is first.
    // to-do: isOffStart
    if (!update.input.isOnStart('Action')) return true;
    return false;
  },
  updateEnt(set, update) {
    const { sprite } = set;
    if (sprite.intersectsSprite(update.cursor, update.time)) {
      update.pickHandled = true;
      sprite.animate(update.time, nextFilm(update, sprite));
      // to-do: really don't like reaching in and touching cursor or all the way to cursor.bounds.start.
    } else if (sprite.intersectsBounds(update.cursor.bounds.start)) {
      update.pickHandled = true;
      Solitaire.reset(update.solitaire);
      update.saveStorage.save.wins = update.solitaire.wins;
      SaveStorage.save(update.saveStorage);
    }
  },
});

function nextFilm(update: Readonly<SublimeECSUpdate>, sprite: Sprite): Film {
  const good = sprite.film.id == 'PatienceTheDemonGood';
  const id = `PatienceTheDemon${good ? 'Evil' : 'Good'}` as const;
  return update.filmByID[id];
}
