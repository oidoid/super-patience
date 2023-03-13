import { I16Box, I16XY } from '@/ooz'
import { Card, Solitaire } from '@/solitaire'
import {
  PileConfig,
  setSpritePositionsForLayout,
  SPEnt,
  SPLayer,
  SuperPatience,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type CardEnt = QueryEnt<{ card: Card; sprite: Sprite }, typeof query>

const query = 'card & sprite'

interface PickState {
  readonly ents: {
    readonly ent: Partial<SPEnt>
    /** The adjustment to offset future pick inputs by. */
    readonly offset: Readonly<I16XY>
  }[]
}

export class CardSystem implements System<CardEnt, SPEnt> {
  readonly query = query

  #picked?: PickState | undefined
  readonly #piles: { pile: PileConfig; sprite: Sprite }[]
  readonly #vacantStock: Sprite

  constructor(
    piles: { pile: PileConfig; sprite: Sprite }[],
    vacantStock: Sprite,
  ) {
    this.#piles = piles
    this.#vacantStock = vacantStock
  }

  // to-do: this list will need to be cut down by xy intersection anyway
  run(ents: ReadonlySet<CardEnt>, game: SuperPatience): void {
    if (game.pickHandled) return

    const picked = pickClosest(ents, game)
    const isStockClick = picked?.sprite.intersectsSprite(
      this.#vacantStock,
      game.time,
    )

    if (
      picked?.card.direction == 'Down' && !isStockClick &&
        game.input.isOffStart('Action') ||
      picked?.card.direction == 'Up' && !isStockClick &&
        game.input.isOnStart('Action') ||
      picked != null && isStockClick &&
        game.input.isOffStart('Action')
    ) {
      game.pickHandled = true
      this.setPickRange(game, picked.card)
    }

    if (game.input.isOn('Action') && this.#picked != null) {
      moveToPick(game, this.#picked)
    } else {
      // Only rerender if pick operation is done otherwise cards snap to fast in reserve.
      setSpritePositionsForLayout(
        game.ecs,
        game.filmByID,
        game.solitaire,
        game.time,
      )
    }

    if (
      game.solitaire.selected != null && game.input.isOffStart('Action')
    ) {
      if (this.#picked == null) {
        const picked = pickClosest(ents, game)
        if (picked != null) {
          Solitaire.point(game.solitaire, picked.card)
        } else Solitaire.deselect(game.solitaire)
        setSpritePositionsForLayout(
          game.ecs,
          game.filmByID,
          game.solitaire,
          game.time,
        )
      } else {
        // to-do: this is essentially invalidateBoard()

        const bestMatch = this.findbestmatch(game)
        if (
          bestMatch != null && game.solitaire.selected != null &&
          bestMatch.pile.pile.type != 'Waste'
        ) {
          Solitaire.build(game.solitaire, bestMatch.pile.pile)
        }
        Solitaire.deselect(game.solitaire)

        setSpritePositionsForLayout(
          game.ecs,
          game.filmByID,
          game.solitaire,
          game.time,
        )

        this.#picked = undefined
        // to-do: only allow dropping on top card. do i need invisi pile hit box?
        // const newPlayLocation = Layout.play(game.layout, intersection with)
        // update XY based on new position which may be putting back
      }
    }
  }

  setPickRange(game: SuperPatience, card: Card): void {
    const selected = Solitaire.point(game.solitaire, card)
    if (selected == null) return
    const ents = selected.cards.map(
      (card) => {
        const ent = game.ecs.get(card)
        return {
          ent,
          offset: game.cursor.bounds.xy.copy().sub(ent.sprite!.bounds.xy),
        }
      },
      `Card ${card} missing sprite.`,
    )
    // to-do: free this ent on ECS remove
    this.#picked = { ents }

    for (const sprite of ents.map((data) => data.ent.sprite)) {
      sprite!.layer = SPLayer.Picked
    }
  }

  findbestmatch(update: SuperPatience):
    | {
      intersection: I16Box
      pile: { pile: PileConfig; sprite: Sprite }
    }
    | undefined {
    const pointedCard = this.#picked?.ents[0]?.ent
    let bestMatch
    if (pointedCard != null && pointedCard.sprite != null) {
      for (const pile of this.#piles) {
        const intersection = pointedCard.sprite.bounds.copy().intersection(
          pile.sprite.bounds,
        )
        if (intersection.flipped || intersection.areaNum <= 0) continue
        if (
          pile.pile.type == 'Waste' ||
          !Solitaire.isBuildable(update.solitaire, pile.pile)
        ) continue
        if (
          bestMatch == null ||
          intersection.areaNum > bestMatch.intersection.areaNum
        ) bestMatch = { intersection, pile }
      }
    }
    return bestMatch
  }
}

type Picked = { ent: CardEnt; card: Card; sprite: Sprite }

function pickClosest(
  ents: ReadonlySet<CardEnt>,
  game: SuperPatience,
): Picked | undefined {
  if (game.input == null) return
  let picked: Picked | undefined
  for (const ent of ents) {
    const { card, sprite } = ent
    if (!sprite.intersectsSprite(game.cursor, game.time)) {
      continue
    }

    if (picked == null || sprite.isAbove(picked.sprite)) {
      picked = { ent, card, sprite }
    }
  }
  return picked
}

function moveToPick(game: SuperPatience, picked: PickState): void {
  for (const ent of picked.ents) {
    // to-do: versus const sprite = ECS.get(ecs, 'Sprite', ent);
    ent.ent.sprite!.bounds.moveToTrunc(
      game.cursor.bounds.xy.copy().sub(ent.offset),
    )
  }
}
