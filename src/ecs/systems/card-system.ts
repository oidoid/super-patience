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

interface PileEnt {
  readonly pile: PileConfig
  readonly sprite: Sprite
}

type PickState = {
  readonly ent: Partial<SPEnt>
  /** The adjustment to offset future pick inputs by. */
  readonly offset: Readonly<I16XY>
}[]

export class CardSystem implements System<CardEnt, SPEnt> {
  readonly query = query

  readonly #picked: PickState = []
  readonly #piles: PileEnt[]
  readonly #vacantStock: Sprite

  constructor(piles: PileEnt[], vacantStock: Sprite) {
    this.#piles = piles
    this.#vacantStock = vacantStock
  }

  run(ents: ReadonlySet<CardEnt>, game: SuperPatience): void {
    if (game.pickHandled) return

    const picked = pick(ents, game)
    const isStockClick = picked?.sprite.intersectsSprite(
      this.#vacantStock,
      game.time,
    )

    if (
      picked?.card.direction == 'Down' && !isStockClick &&
        game.input.isOffStart('Action') ||
      picked?.card.direction == 'Up' && !isStockClick &&
        game.input.isOnStart('Action') ||
      picked != null && isStockClick && game.input.isOffStart('Action')
    ) {
      game.pickHandled = true
      this.setPickRange(game, picked.card)
    }

    if (game.input.isOn('Action') && this.#picked.length > 0) {
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

    if (game.solitaire.selected != null && game.input.isOffStart('Action')) {
      if (this.#picked.length == 0) {
        const picked = pick(ents, game)
        if (picked == null) Solitaire.deselect(game.solitaire)
        else Solitaire.point(game.solitaire, picked.card)
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
          bestMatch.ent.pile.type != 'Waste'
        ) {
          Solitaire.build(game.solitaire, bestMatch.ent.pile)
        }
        Solitaire.deselect(game.solitaire)

        setSpritePositionsForLayout(
          game.ecs,
          game.filmByID,
          game.solitaire,
          game.time,
        )

        this.#picked.length = 0
      }
    }
  }

  setPickRange(game: SuperPatience, card: Card): void {
    const selected = Solitaire.point(game.solitaire, card)
    if (selected == null) return
    const picked = selected.cards.map(
      (card) => {
        const ent = game.ecs.get(card)
        return {
          ent,
          offset: game.cursor.bounds.xy.copy().sub(ent.sprite!.bounds.xy),
        }
      },
      `Card ${card} missing sprite.`,
    )
    this.#picked.length = 0
    this.#picked.push(...picked) // to-do: free this ent on ECS remove

    for (const sprite of picked.map((pick) => pick.ent.sprite)) {
      sprite!.layer = SPLayer.Picked
    }
  }

  findbestmatch(update: SuperPatience):
    | { intersection: I16Box; ent: PileEnt }
    | undefined {
    const pointedCard = this.#picked[0]?.ent
    let bestMatch
    if (pointedCard != null && pointedCard.sprite != null) {
      for (const ent of this.#piles) {
        const intersection = pointedCard.sprite.bounds.copy().intersection(
          ent.sprite.bounds,
        )
        if (intersection.flipped || intersection.empty) continue
        if (
          ent.pile.type == 'Waste' ||
          !Solitaire.isBuildable(update.solitaire, ent.pile)
        ) continue
        if (
          bestMatch == null ||
          intersection.areaNum > bestMatch.intersection.areaNum
        ) bestMatch = { intersection, ent }
      }
    }
    return bestMatch
  }
}

function pick(
  ents: ReadonlySet<CardEnt>,
  game: SuperPatience,
): CardEnt | undefined {
  if (game.input == null) return
  let picked: CardEnt | undefined
  for (const ent of ents) {
    if (!ent.sprite.intersectsSprite(game.cursor, game.time)) continue
    if (picked == null || ent.sprite.isAbove(picked.sprite)) picked = ent
  }
  return picked
}

function moveToPick(game: SuperPatience, picked: PickState): void {
  for (const pick of picked) {
    pick.ent.sprite?.bounds.moveToTrunc(
      game.cursor.bounds.xy.copy().sub(pick.offset),
    )
  }
}
