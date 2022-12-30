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
      // update.pointer?.on2([[''], ['']], 'Set', 'Pen', 'Touch')
      return !!update.pickHandled || !update.input.isOffStart('Action');
    },
    updateEnt(set, update) {
      if (update.pickHandled) return;
      if (!set.sprite.intersectsBounds(update.cursor.bounds.start)) return;
      update.pickHandled = true;
      Solitaire.deal(update.solitaire);
      setSpritePositionsForLayout(
        update.ecs,
        update.filmByID,
        update.solitaire,
        update.time,
      );
    },
  });