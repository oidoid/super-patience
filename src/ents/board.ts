import * as V from '@oidoid/void'
import {
  type Card,
  solitaireBuild,
  solitaireDeselect,
  solitaireIsBuildable,
  solitairePoint
} from 'klondike-solitaire'
import {invalidateSolitaireSprites} from '../level/level.ts'
import type {CardEnt, PickState, PileEnt} from './ent.ts'

export type BoardEnt = V.SysEnt<BoardSys>

export class BoardSys implements V.Sys {
  readonly query = 'board'

  // to-do: assumes will be called every _frame_ to _invalidate_.
  update(ent: BoardEnt, v: V.Void): void {
    if (v.input.handled) return

    const picked = pick(v)
    const isStockPick =
      v.loader.vacantStock &&
      picked?.sprite.hitsZ(v.loader.vacantStock.sprite, v.cam)

    if (
      picked != null &&
      !ent.board.selected.length &&
      ((!isStockPick && v.input.isOnStart('A')) ||
        (isStockPick && v.input.isOffStart('A')))
    ) {
      v.input.handled = true
      setSelected(ent, v, picked.card)
    }

    if (v.input.isOn('A') && ent.board.selected.length > 0) {
      v.input.handled = true // dragging.
      moveEntsToCursor(v, ent.board.selected)
    }
    // only rerender if pick operation is done otherwise cards snap too fast
    // in the reserve.
    else invalidateSolitaireSprites(v)

    if (v.solitaire.selected != null && v.input.isOffStart('A')) {
      // drag finished.
      v.input.handled = true

      if (ent.board.selected.length) {
        const dropped = drop(ent, v)
        if (
          dropped != null &&
          v.solitaire.selected != null &&
          dropped.pile.type !== 'Waste'
        )
          solitaireBuild(v.solitaire, dropped.pile)
        solitaireDeselect(v.solitaire)

        ent.board.selected.length = 0
      } else {
        const picked = pick(v)
        if (picked == null) solitaireDeselect(v.solitaire)
        else solitairePoint(v.solitaire, picked.card)
      }
      invalidateSolitaireSprites(v)
    }
  }
}

function drop(boardEnt: BoardEnt, v: V.Void): PileEnt | undefined {
  const pick = boardEnt.board.selected[0]
  if (pick == null) return
  let drop: {area: number; ent: PileEnt} | undefined
  for (const ent of v.loader.piles) {
    const overlap = V.boxIntersect(pick.sprite, ent.sprite)
    if (
      overlap.w <= 0 ||
      overlap.h <= 0 ||
      ent.pile.type === 'Waste' ||
      !solitaireIsBuildable(v.solitaire, ent.pile)
    )
      continue
    const area = overlap.w * overlap.h
    if (drop == null || area > drop.area) drop = {area, ent}
  }
  return drop?.ent
}

function pick(v: V.Void): CardEnt | undefined {
  let picked: CardEnt | undefined
  for (const ent of v.loader.cards) {
    if (!v.loader.cursor?.sprite.hitsZ(ent.sprite, v.cam)) continue
    if (picked == null || ent.sprite.above(picked.sprite)) picked = ent
  }
  return picked
}

function moveEntsToCursor(v: V.Void, selected: PickState): void {
  if (!v.loader.cursor) return
  for (const pick of selected) {
    pick.sprite.x = Math.trunc(v.loader.cursor.sprite.x) - pick.offset.x
    pick.sprite.y = Math.trunc(v.loader.cursor.sprite.y) - pick.offset.y
  }
}

function setSelected(ent: BoardEnt, v: V.Void, card: Card): void {
  const selection = solitairePoint(v.solitaire, card)
  if (selection == null) return

  const selected = selection.cards.map(card => {
    const sprite = v.spriteByCard.get(card)
    if (!sprite) throw Error('no sprite')
    if (!v.loader.cursor) throw Error('no cursor')
    return {
      sprite,
      offset: {
        x: Math.trunc(v.loader.cursor.sprite.x) - sprite.x,
        y: Math.trunc(v.loader.cursor.sprite.y) - sprite.y
      }
    }
  })

  // elevate the selection to the pick layer.
  for (const select of selected) select.sprite.z = V.Layer.G

  ent.board.selected.length = 0
  ent.board.selected.push(...selected)
}
