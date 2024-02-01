import {
  Card,
  solitaireBuild,
  solitaireDeselect,
  solitaireIsBuildable,
  solitairePoint,
} from '@/solitaire'
import { Box, Sprite, XY } from '@/void'
import { Game } from '../../index.ts'
import { Layer } from '../../layer.ts'
import { invalidateSolitaireSprites } from '../../level/level.ts'
import { PileConfig } from '../components/pile-config.ts'

export type CardEnt = { readonly card: Card; readonly sprite: Sprite }

export type PileEnt = { readonly pile: PileConfig; readonly sprite: Sprite }

type PickState = {
  readonly sprite: Sprite
  /** The adjustment to offset future pick inputs by. */
  readonly offset: Readonly<XY>
}[]

export class CardSystem {
  readonly query: (keyof CardEnt)[] = ['card', 'sprite']

  readonly #selected: PickState = []
  readonly #piles: PileEnt[]
  readonly #vacantStock: Sprite

  constructor(piles: PileEnt[], vacantStock: Sprite) {
    this.#piles = piles
    this.#vacantStock = vacantStock
  }

  run(ents: Iterable<CardEnt>, game: Game): void {
    if (game.v.ctrl.handled) return

    const picked = pick(ents, game)
    const isStockPick = picked?.sprite.hits(this.#vacantStock)

    if (
      picked?.card.direction === 'Down' && !isStockPick &&
        game.v.ctrl.isOffStart('A') ||
      picked?.card.direction === 'Up' && !isStockPick &&
        game.v.ctrl.isOnStart('A') ||
      picked != null && isStockPick && game.v.ctrl.isOffStart('A')
    ) {
      game.v.ctrl.handled = true
      this.#setSelected(game, picked.card)
    }

    if (game.v.ctrl.isOn('A') && this.#selected.length > 0) {
      game.v.ctrl.handled = true // Dragging.
      moveEntsToCursor(game, this.#selected)
    } else {
      // Only rerender if pick operation is done otherwise cards snap too fast
      // in the reserve.
      invalidateSolitaireSprites(game)
    }

    if (game.solitaire.selected != null && game.v.ctrl.isOffStart('A')) {
      // Drag finished. Prevent pick off start from being rehandled elsewhere.
      game.v.ctrl.handled = true

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
      invalidateSolitaireSprites(game)
    }
  }

  #setSelected(game: Game, card: Card): void {
    const selection = solitairePoint(game.solitaire, card)
    if (selection == null) return

    const selected = selection.cards.map(
      (card) => {
        const sprite = game.spriteByCard.get(card)!
        return {
          sprite,
          offset: { x: game.cursor.x - sprite.x, y: game.cursor.y - sprite.y },
        }
      },
    )

    // Elevate the selection to the pick layer.
    for (const select of selected) select.sprite.z = Layer.Picked

    this.#selected.length = 0
    this.#selected.push(...selected)
  }

  #drop(update: Game): PileEnt | undefined {
    const pick = this.#selected[0]
    if (pick == null) return
    let drop
    for (const ent of this.#piles) {
      const overlap = intersection(pick.sprite, ent.sprite) // .hitbox
      if (
        overlap.w <= 0 || overlap.h <= 0 || ent.pile.type === 'Waste' ||
        !solitaireIsBuildable(update.solitaire, ent.pile)
      ) continue
      const area = overlap.w * overlap.h
      if (drop == null || area > drop.area) drop = { area, ent }
    }
    return drop?.ent
  }
}

function pick(ents: Iterable<CardEnt>, game: Game): CardEnt | undefined {
  let picked: CardEnt | undefined
  for (const ent of ents) {
    if (!ent.sprite.hits(game.cursor)) continue
    if (picked == null || ent.sprite.above(picked.sprite)) picked = ent
  }
  return picked
}

function moveEntsToCursor(game: Game, selected: PickState): void {
  for (const pick of selected) {
    pick.sprite.x = game.cursor.x - pick.offset.x
    pick.sprite.y = game.cursor.y - pick.offset.y
  }
}

function intersection(lhs: Readonly<Box>, rhs: Readonly<Box>): Box {
  const x = Math.max(lhs.x, rhs.x)
  const y = Math.max(lhs.y, rhs.y)
  return {
    x,
    y,
    w: Math.min(lhs.x + lhs.w, rhs.x + rhs.w) - x,
    h: Math.min(lhs.y + lhs.h, rhs.y + rhs.h) - y,
  }
}
