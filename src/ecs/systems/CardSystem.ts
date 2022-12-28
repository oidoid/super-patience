import { I16Box, I16XY, NonNull } from '@/oidlib';
import { Card, Solitaire } from '@/solitaire';
import {
  PileConfig,
  setSpritePositionsForLayout,
  SublimeComponentSet,
  SublimeECSUpdate,
  SublimeLayer,
} from '@/sublime-solitaire';
import { Sprite, System } from '@/void';

export interface CardSet {
  readonly card: Card;
  readonly sprite: Sprite;
}

interface PickState {
  readonly ents: {
    readonly components: Partial<SublimeComponentSet>;
    /** The adjustment to offset future pick inputs by. */
    readonly offset: Readonly<I16XY>;
  }[];
}

export class CardSystem implements System<CardSet, SublimeECSUpdate> {
  query = new Set(['card', 'sprite'] as const);

  #picked?: PickState | undefined;
  piles: { pile: PileConfig; sprite: Sprite }[] = [];
  vacantStock: Sprite | undefined;

  // to-do: this list will need to be cut down by xy intersection anyway
  update(sets: Set<CardSet>, update: SublimeECSUpdate): void {
    if (update.pickHandled) return;
    if (
      update.input.isOffStart('Action') ||
      update.input.isOnStart('Action')
    ) {
      const picked = pickClosest(sets, update);
      const isStockClick = this.vacantStock &&
        picked?.sprite.intersectsSprite(this.vacantStock, update.time);

      if (
        picked != null && !isStockClick &&
          update.input.isOnStart('Action') ||
        picked != null && isStockClick &&
          update.input.isOffStart('Action')
      ) {
        update.pickHandled = true;
        this.setPickRange(update, picked.card);
      }
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
      update.solitaire.selected != null &&
      update.input.isOffStart('Action')
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
        if (bestMatch != null && update.solitaire.selected != null) {
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

  setPickRange(update: SublimeECSUpdate, card: Card): void {
    const selected = Solitaire.point(update.solitaire, card);
    if (selected == null) return;
    const ents = selected.cards.map(
      (card) => {
        const components = NonNull(update.ecs.componentsByRef.get(card));
        return {
          components,
          offset: I16XY.sub(
            I16XY(update.cursor.bounds.start), // to-do: this sucks. so easy to accidentally mutate LHS since it's implicitly this.
            components.sprite!.bounds.start,
          ),
        };
      },
      `Card ${card} missing sprite.`,
    );
    // to-do: free this ent on ECS remove
    this.#picked = { ents };

    for (const sprite of ents.map((data) => data.components.sprite!)) {
      sprite.layer = SublimeLayer.Picked;
    }
  }

  findbestmatch(
    update: SublimeECSUpdate,
  ):
    | { intersection: I16Box; pile: { pile: PileConfig; sprite: Sprite } }
    | undefined {
    const pointedCard = this.#picked?.ents[0]?.components;
    let bestMatch;
    if (pointedCard != null && pointedCard.sprite != null) {
      for (const pile of this.piles) {
        if (pile.sprite == null) continue;
        const intersection = I16Box.intersection(
          pointedCard.sprite.bounds,
          pile.sprite.bounds,
        );
        if (I16Box.flipped(intersection) || I16Box.area(intersection) <= 0) {
          continue;
        }
        if (!Solitaire.isBuildable(update.solitaire, pile.pile)) continue;
        if (
          bestMatch == null ||
          I16Box.area(intersection) > I16Box.area(bestMatch.intersection)
        ) bestMatch = { intersection, pile };
      }
    }
    return bestMatch;
  }
}

type Picked = { set: CardSet; card: Card; sprite: Sprite };

function pickClosest(
  sets: Set<CardSet>,
  update: SublimeECSUpdate,
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

function moveToPick(update: SublimeECSUpdate, picked: PickState): void {
  for (let i = 0; i < picked.ents.length; i++) {
    I16Box.moveTo(
      picked.ents[i]!.components.sprite!.bounds, // to-do versus const sprite = ECS.get(ecs, 'Sprite', ent);
      I16XY.sub(
        I16XY(update.cursor.bounds.start),
        picked.ents[i]!.offset,
      ),
    );
  }
}
