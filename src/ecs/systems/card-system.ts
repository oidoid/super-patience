import { I16Box, I16XY, NonNull } from '@/oidlib';
import { Card, Solitaire } from '@/solitaire';
import {
  PileConfig,
  setSpritePositionsForLayout,
  SPComponentSet,
  SPECSUpdate,
  SPLayer,
} from '@/super-patience';
import { Sprite, System } from '@/void';

export interface CardSet {
  readonly card: Card;
  readonly sprite: Sprite;
}

interface PickState {
  readonly ents: {
    readonly components: Partial<SPComponentSet>;
    /** The adjustment to offset future pick inputs by. */
    readonly offset: Readonly<I16XY>;
  }[];
}

export class CardSystem implements System<CardSet, SPECSUpdate> {
  query = new Set(['card', 'sprite'] as const);

  #picked?: PickState | undefined;
  piles: { pile: PileConfig; sprite: Sprite }[] = [];
  vacantStock: Sprite | undefined;

  // to-do: this list will need to be cut down by xy intersection anyway
  update(sets: Set<CardSet>, update: SPECSUpdate): void {
    if (update.pickHandled) return;

    const picked = pickClosest(sets, update);
    const isStockClick = this.vacantStock &&
      picked?.sprite.intersectsSprite(this.vacantStock, update.time);

    if (
      picked?.card.direction == 'Down' && !isStockClick &&
        update.input.isOffStart('Action') ||
      picked?.card.direction == 'Up' && !isStockClick &&
        update.input.isOnStart('Action') ||
      picked != null && isStockClick &&
        update.input.isOffStart('Action')
    ) {
      update.pickHandled = true;
      this.setPickRange(update, picked.card);
    }

    if (update.input.isOn('Action') && this.#picked != null) {
      moveToPick(update, this.#picked);
    } else {
      // Only rerender if pick operation is done otherwise cards snap to fast in reserve.
      setSpritePositionsForLayout(
        update.ecs,
        update.filmByID,
        update.solitaire,
        update.time,
      );
    }

    if (
      update.solitaire.selected != null && update.input.isOffStart('Action')
    ) {
      if (this.#picked == null) {
        const picked = pickClosest(sets, update);
        if (picked != null) {
          Solitaire.point(update.solitaire, picked.card);
        } else Solitaire.deselect(update.solitaire);
        setSpritePositionsForLayout(
          update.ecs,
          update.filmByID,
          update.solitaire,
          update.time,
        );
      } else {
        // to-do: this is essentially invalidateBoard()

        const bestMatch = this.findbestmatch(update);
        if (
          bestMatch != null && update.solitaire.selected != null &&
          bestMatch.pile.pile.type != 'Waste'
        ) {
          Solitaire.build(update.solitaire, bestMatch.pile.pile);
        }
        Solitaire.deselect(update.solitaire);

        setSpritePositionsForLayout(
          update.ecs,
          update.filmByID,
          update.solitaire,
          update.time,
        );

        this.#picked = undefined;
        // to-do: only allow dropping on top card. do i need invisi pile hit box?
        // const newPlayLocation = Layout.play(state.layout, intersection with)
        // update XY based on new position which may be putting back
      }
    }
  }

  setPickRange(update: SPECSUpdate, card: Card): void {
    const selected = Solitaire.point(update.solitaire, card);
    if (selected == null) return;
    const ents = selected.cards.map(
      (card) => {
        const components = NonNull(update.ecs.componentsByRef.get(card));
        return {
          components,
          offset: update.cursor.bounds.xy.copy().sub(
            components.sprite!.bounds.xy,
          ),
        };
      },
      `Card ${card} missing sprite.`,
    );
    // to-do: free this ent on ECS remove
    this.#picked = { ents };

    for (const sprite of ents.map((data) => data.components.sprite!)) {
      sprite.layer = SPLayer.Picked;
    }
  }

  findbestmatch(update: SPECSUpdate):
    | { intersection: I16Box; pile: { pile: PileConfig; sprite: Sprite } }
    | undefined {
    const pointedCard = this.#picked?.ents[0]?.components;
    let bestMatch;
    if (pointedCard != null && pointedCard.sprite != null) {
      for (const pile of this.piles) {
        if (pile.sprite == null) continue;
        const intersection = pointedCard.sprite.bounds.copy().intersection(
          pile.sprite.bounds,
        );
        if (intersection.flipped || intersection.areaNum <= 0) continue;
        if (
          pile.pile.type == 'Waste' ||
          !Solitaire.isBuildable(update.solitaire, pile.pile)
        ) continue;
        if (
          bestMatch == null ||
          intersection.areaNum > bestMatch.intersection.areaNum
        ) bestMatch = { intersection, pile };
      }
    }
    return bestMatch;
  }
}

type Picked = { set: CardSet; card: Card; sprite: Sprite };

function pickClosest(
  sets: Set<CardSet>,
  update: SPECSUpdate,
): Picked | undefined {
  if (update.input == null) return;
  let picked: Picked | undefined;
  for (const set of sets) {
    const { card, sprite } = set;
    if (!sprite.intersectsSprite(update.cursor, update.time)) {
      continue;
    }

    if (picked == null || sprite.isInFrontOf(picked.sprite)) {
      picked = { set, card, sprite };
    }
  }
  return picked;
}

function moveToPick(update: SPECSUpdate, picked: PickState): void {
  for (const ent of picked.ents) {
    // to-do: versus const sprite = ECS.get(ecs, 'Sprite', ent);
    ent.components.sprite!.bounds.moveToTrunc(
      update.cursor.bounds.xy.copy().sub(ent.offset),
    );
  }
}
