import { XY } from '@/ooz'
import {
  Card,
  solitaireBuild,
  solitaireDeselect,
  solitaireIsBuildable,
  solitairePoint,
} from '@/solitaire'
import {
  invalidateSolitaireSprites,
  PileConfig,
  SPEnt,
  SPLayer,
  SuperPatience,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type CardEnt = QueryEnt<
  { card: Card; sprites: [Sprite, ...Sprite[]] },
  typeof query
>

const query = 'card & sprites'

interface PileEnt {
  readonly pile: PileConfig
  readonly sprites: [Sprite, ...Sprite[]]
}

type PickState = {
  readonly ent: Partial<SPEnt>
  /** The adjustment to offset future pick inputs by. */
  readonly offset: Readonly<XY>
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
    const isStockPick = picked?.sprites[0].hits(this.#vacantStock)

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
      game.pickHandled = true // Dragging.
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
      // Drag finished. Prevent pick off start from being rehandled elsewhere.
      game.pickHandled = true

      if (this.#selected.length === 0) {
        const picked = pick(ents, game)
        if (picked == null) solitaireDeselect(game.solitaire)
        else solitairePoint(game.solitaire, picked.card)
      } else {
        const drop = this.#drop(game)
        if (
          drop != null && game.solitaire.selected != null &&
          drop.pile.type !== 'Waste'
        ) solitaireBuild(game.solitaire, drop.pile)
        solitaireDeselect(game.solitaire)

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
    const selection = solitairePoint(game.solitaire, card)
    if (selection == null) return

    // Look up each card's ent by component.
    const selected = selection.cards.map(
      (card) => {
        const ent = game.ecs.get(card)
        return {
          ent,
          offset: game.cursor.bounds.xy.copy().sub(ent.sprites![0].bounds.xy),
        }
      },
      `Card ${card} missing sprites[0].`,
    )

    // Elevate the selection to the pick layer.
    for (const select of selected) select.ent.sprites![0].layer = SPLayer.Picked

    this.#selected.length = 0
    this.#selected.push(...selected) // to-do: free this ent on ECS remove
  }

  #drop(update: SuperPatience): PileEnt | undefined {
    const pick = this.#selected[0]?.ent
    if (pick?.sprites == null) return
    let drop
    for (const ent of this.#piles) {
      const overlap = pick.sprites[0].bounds.copy().intersection(
        ent.sprites[0].bounds,
      )
      if (
        overlap.flipped || overlap.empty || ent.pile.type === 'Waste' ||
        !solitaireIsBuildable(update.solitaire, ent.pile)
      ) continue
      if (drop == null || overlap.area > drop.area) {
        drop = { area: overlap.area, ent }
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
    if (!ent.sprites[0].hits(game.cursor)) continue
    if (picked == null || ent.sprites[0].isAbove(picked.sprites[0])) {
      picked = ent
    }
  }
  return picked
}

function moveEntsToCursor(game: SuperPatience, selected: PickState): void {
  for (const pick of selected) {
    pick.ent.sprites?.[0].setXY(game.cursor.bounds.xy.copy().sub(pick.offset))
  }
}
