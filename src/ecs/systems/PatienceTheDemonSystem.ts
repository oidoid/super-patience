import { Film } from '@/atlas-pack';
import { Immutable, NonNull } from '@/oidlib';
import { Solitaire } from '@/solitaire';
import { Button, Input, Sprite, System } from '@/void';
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
    // to-do: need notion of handled state so that picks don't bleed.
    // to-do: need notion of system order so that pickable is first.
    if (update.inputs.pick == null) return true;
    if ((update.inputs.pick.buttons & Button.Primary) != Button.Primary) {
      return true;
    }
    if (!Input.activeTriggered(update.inputs.pick)) return true;
    return false;
  },
  updateEnt(set, update) {
    const pickXY = NonNull(update.inputs.pick).xy;
    const { sprite } = set;
    if (!sprite.intersectsBounds(pickXY)) return;
    if (!sprite.intersects(pickXY, update.time)) {
      Solitaire.reset(update.solitaire);
      update.saveStorage.save.wins = update.solitaire.wins;
      SaveStorage.save(update.saveStorage);
      return;
    }
    sprite.animate(update.time, nextFilm(update, sprite));
  },
});

function nextFilm(update: Readonly<SublimeECSUpdate>, sprite: Sprite): Film {
  const good = sprite.film.id == 'PatienceTheDemonGood';
  const id = `PatienceTheDemon${good ? 'Evil' : 'Good'}` as const;
  return update.filmByID[id];
}
