import { Immutable } from '@/oidlib';
import { Solitaire } from '@/solitaire';
import { Sprite, System } from '@/void';
import { setSpritePositionsForLayout } from '../../level/Level.ts';
import { SublimeECSUpdate } from '../SublimeECSUpdate.ts';

export interface VacantStockSet {
  readonly vacantStock: Record<never, never>;
  readonly sprite: Sprite;
}

export const VacantStockSystem: System<VacantStockSet, SublimeECSUpdate> =
  Immutable({
    query: new Set(['vacantStock', 'sprite']),
    skip(update) {
      // update.pointer?.on2([['Primary'], ['Primary']], 'Set', 'Pen', 'Touch')
      return !!update.pickHandled ||
        update.input == null ||
        // to-do: inactiveTriggered when i have picking sorted to only allow one
        // handler.
        !update.input.onStart('ActionPrimary');
    },
    updateEnt(set, update) {
      if (!set.sprite.intersectsBounds(update.cursor.bounds.start)) return;
      Solitaire.deal(update.solitaire);
      setSpritePositionsForLayout(
        update.ecs,
        update.filmByID,
        update.solitaire,
        update.time,
      );
    },
  });
