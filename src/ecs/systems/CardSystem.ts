import { assertNonNull, I16Box, I16XY, Immutable, NonNull } from '@/oidlib';
import { Card, Solitaire } from '@/solitaire';
import {
  setSpritePositionsForLayout,
  SublimeECSUpdate,
  SublimeLayer,
} from '@/sublime-solitaire';
import { Sprite, System } from '@/void';

export interface CardSet {
  readonly card: Card;
  readonly sprite: Sprite;
}

export const CardSystem: System<CardSet, SublimeECSUpdate> = Immutable({
  query: new Set(['card', 'sprite']),
  // to-do: this list will need to be cut down by xy intersection anyway
  update(sets, update) {
    if (update.input.isOn('ActionPrimary')) {
      if (update.input.isOnStart('ActionPrimary')) {
        const picked = pickClosest(sets, update);
        if (picked != null) {
          update.pickHandled = true;
          setPickRange(update, picked.card);
        }
      }
      if (update.picked != null) {
        moveToPick(update);
      } else {
        // Only rerender if pick operation is done otherwise cards snap to fast in reserve.
        setSpritePositionsForLayout(
          update.ecs,
          update.filmByID,
          update.solitaire,
          update.time,
        );
        return;
      }
    }

    if (
      update.solitaire.selected != null &&
      update.input.isOffStart('ActionPrimary')
    ) {
      if (update.picked == null) {
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

        const bestMatch = findbestmatch(update);
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

        update.picked = undefined;
        // to-do: only allow dropping on top card. do i need invisi pile hit box?
        // const newPlayLocation = Layout.play(state.layout, intersection with)
        // update XY based on new position which may be putting back
      }
    }
  },
});

type Picked = { set: CardSet; card: Card; sprite: Sprite };

function findbestmatch(update: SublimeECSUpdate) {
  const pointedCard = update.picked?.ents[0]?.components; // to-do: don't throw if component is missing?
  let bestMatch;
  if (pointedCard != null && pointedCard.sprite != null) {
    for (const pile of update.piles) {
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

    if ((picked == null || sprite.compareDepth(picked.sprite) < 0)) {
      picked = { set, card, sprite };
    }
  }
  return picked;
}

function setPickRange(update: SublimeECSUpdate, card: Card): void {
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
  update.picked = { ents };

  for (const sprite of ents.map((data) => data.components.sprite!)) {
    sprite.layer = SublimeLayer.Picked;
  }
}

function moveToPick(update: SublimeECSUpdate): void {
  assertNonNull(update.picked);

  for (let i = 0; i < update.picked.ents.length; i++) {
    I16Box.moveTo(
      update.picked.ents[i]!.components.sprite!.bounds, // to-do versus const sprite = ECS.get(ecs, 'Sprite', ent);
      I16XY.sub(
        I16XY(update.cursor.bounds.start),
        update.picked.ents[i]!.offset,
      ),
    );
  }
}
