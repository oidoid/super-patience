import { I16XY } from '@/ooz'
import { Card, Solitaire } from '@/solitaire'
import {
  invalidateSolitaireSprites,
  PileConfig,
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

  readonly #selected: PickState = []
  readonly #piles: PileEnt[]
  readonly #vacantStock: Sprite

  constructor(piles: PileEnt[], vacantStock: Sprite) {
    this.#piles = piles
    this.#vacantStock = vacantStock
  }

  run(ents: ReadonlySet<CardEnt>, game: SuperPatience): void {
    if (game.pickHandled) return

    const picked = pick(ents, game)
    const isStockPick = picked?.sprite.intersectsSprite(
      this.#vacantStock,
      game.time,
    )

    if (
      picked?.card.direction === 'Down' && !isStockPick &&
        game.input.isOffStart('Action') ||
      picked?.card.direction === 'Up' && !isStockPick &&
        game.input.isOnStart('Action') ||
      picked != null && isStockPick && game.input.isOffStart('Action')
    ) {
      game.pickHandled = true
      this.#setSelected(game, picked.card)
    }

    if (game.input.isOn('Action') && this.#selected.length > 0) {
      moveEntsToCursor(game, this.#selected)
    } else {
      // Only rerender if pick operation is done otherwise cards snap too fast
      // in the reserve.
      invalidateSolitaireSprites(
        game.ecs,
        game.filmByID,
        game.solitaire,
        game.time,
      )
    }

    if (game.solitaire.selected != null && game.input.isOffStart('Action')) {
      if (this.#selected.length === 0) {
        const picked = pick(ents, game)
        if (picked == null) Solitaire.deselect(game.solitaire)
        else Solitaire.point(game.solitaire, picked.card)
      } else {
        const drop = this.#drop(game)
        if (
          drop != null && game.solitaire.selected != null &&
          drop.pile.type !== 'Waste'
        ) Solitaire.build(game.solitaire, drop.pile)
        Solitaire.deselect(game.solitaire)

        this.#selected.length = 0
      }

      invalidateSolitaireSprites(
        game.ecs,
        game.filmByID,
        game.solitaire,
        game.time,
      )
    }
  }

  #setSelected(game: SuperPatience, card: Card): void {
    const selection = Solitaire.point(game.solitaire, card)
    if (selection == null) return

    // Look up each card's ent by component.
    const selected = selection.cards.map(
      (card) => {
        const ent = game.ecs.get(card)
        return {
          ent,
          offset: game.cursor.bounds.xy.copy().sub(ent.sprite!.bounds.xy),
        }
      },
      `Card ${card} missing sprite.`,
    )

    // Elevate the selection to the pick layer.
    for (const select of selected) select.ent.sprite!.layer = SPLayer.Picked

    this.#selected.length = 0
    this.#selected.push(...selected) // to-do: free this ent on ECS remove
  }

  #drop(update: SuperPatience): PileEnt | undefined {
    const pick = this.#selected[0]?.ent
    if (pick?.sprite == null) return
    let drop
    for (const ent of this.#piles) {
      const overlap = pick.sprite.bounds.copy().intersection(ent.sprite.bounds)
      if (
        overlap.flipped || overlap.empty || ent.pile.type === 'Waste' ||
        !Solitaire.isBuildable(update.solitaire, ent.pile)
      ) continue
      if (drop == null || overlap.areaNum > drop.area) {
        drop = { area: overlap.areaNum, ent }
      }
    }
    return drop?.ent
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

function moveEntsToCursor(game: SuperPatience, selected: PickState): void {
  for (const pick of selected) {
    pick.ent.sprite?.bounds.moveToClamp(
      game.cursor.bounds.xy.copy().sub(pick.offset),
    )
  }
}
