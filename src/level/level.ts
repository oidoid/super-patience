import * as V from '@oidoid/void'
import {
  type Card,
  cardToASCII,
  type Solitaire,
  type Suit
} from 'klondike-solitaire'

export const mod: number = 8
export const cardWH: V.WH = {w: 24, h: 32}
const tableauY: number = 72
const boardX: number = 2 * mod
const boardY: number = 16
const hiddenY: number = -1024

// to-do: can this be a system or systems? It seems like it's a "board" system
// but has some overlap with `BoardSys` which calls these functions.

export function invalidateSolitaireSprites(v: V.Void): void {
  for (const [iX, col] of v.solitaire.tableau.entries()) {
    for (const [iY, card] of col.entries()) {
      const sprite = v.spriteByCard.get(card)
      if (!sprite) throw Error('no sprite')
      const xy = getTableauCardXY(v.atlas.default, iX, iY)
      const tag = getCardTag(card)
      const z = card.direction === 'Up' ? V.Layer.F : V.Layer.E
      // to-do: how can this be on the ent level and also not invalidate the world?
      v.invalid ||=
        xy.x !== sprite.x ||
        xy.y !== sprite.y ||
        z !== sprite.z ||
        tag !== sprite.tag
      sprite.x = xy.x
      sprite.y = xy.y
      sprite.z = z
      sprite.tag = tag
    }
  }
  for (const pillar of v.solitaire.foundation) {
    for (const [i, card] of pillar.entries()) {
      const sprite = v.spriteByCard.get(card)
      if (!sprite) throw Error('no sprite')
      const xy = getFoundationCardXY(v.atlas.default, card.suit)
      // force all cards except the top to downward since they're in the exact
      // same position and are not layered correctly for rendering.
      const tag = i === pillar.length - 1 ? getCardTag(card) : 'card--Down'
      const z = tag === 'card--Down' ? V.Layer.E : V.Layer.F
      v.invalid ||=
        xy.x !== sprite.x ||
        xy.y !== sprite.y ||
        z !== sprite.z ||
        tag !== sprite.tag
      sprite.x = xy.x
      sprite.y = xy.y
      sprite.z = z
      sprite.tag = tag
    }
  }
  for (const [i, card] of v.solitaire.stock.entries()) {
    const sprite = v.spriteByCard.get(card)
    if (!sprite) throw Error('no sprite')
    const xy = getStockXY(v.solitaire, i)
    const tag = getCardTag(card)
    const z = card.direction === 'Up' ? V.Layer.F : V.Layer.E
    v.invalid ||=
      xy.x !== sprite.x ||
      xy.y !== sprite.y ||
      z !== sprite.z ||
      tag !== sprite.tag
    sprite.x = xy.x
    sprite.y = xy.y
    sprite.z = z
    sprite.tag = tag
  }
  for (const [i, card] of v.solitaire.waste.entries()) {
    const sprite = v.spriteByCard.get(card)
    if (!sprite) throw Error('no sprite')
    const xy = getWasteXY(v.solitaire, i)
    const selected =
      v.solitaire.selected?.pile === 'Waste'
        ? (v.solitaire.selected?.cards.length ?? 0)
        : 0
    const top = Math.max(
      v.solitaire.waste.length + selected - v.solitaire.drawSize,
      0
    )
    const tag = i >= top ? getCardTag(card) : 'card--Down'
    // hide waste under the draw reserve. I can't draw them in the correct
    // order since they have identical XYs.
    const z = tag === 'card--Down' ? V.Layer.E : V.Layer.F
    v.invalid ||=
      xy.x !== sprite.x ||
      xy.y !== sprite.y ||
      z !== sprite.z ||
      tag !== sprite.tag
    sprite.x = xy.x
    sprite.y = xy.y
    sprite.z = z
    sprite.tag = tag
  }
}

export function getStockXY(solitaire: Readonly<Solitaire>, iY: number): V.XY {
  return {
    x: boardX + 160,
    // All cards in the stock are at the same point and on the same layer. Only
    // the top card should be pickable though so hide the rest off-cam since
    // they're not drawn in the correct order.
    y: boardY + (solitaire.stock.length - 1 === iY ? 0 : hiddenY)
  }
}

export function getWasteXY(solitaire: Readonly<Solitaire>, i: number): V.XY {
  const selected =
    solitaire.selected?.pile === 'Waste'
      ? (solitaire.selected?.cards.length ?? 0)
      : 0
  const top = Math.max(
    solitaire.waste.length + selected - solitaire.drawSize,
    0
  )
  const mul = Math.max(i - top, 0)
  return {x: 208, y: boardY + mul * mod}
}

export function getFoundationCardXY(atlas: V.Atlas, suit: Suit): V.XY {
  const anim = atlas.anim[`card--Vacant${suit}`]
  const mul = {Clubs: 0, Diamonds: 1, Hearts: 2, Spades: 3}[suit]
  return {x: boardX + mod * 4 + mul * (anim.w + mod), y: boardY}
}

export function getTableauCardXY(atlas: V.Atlas, iX: number, iY: number): V.XY {
  const anim = atlas.anim['card--VacantPile']
  return {x: boardX + iX * (anim.w + mod), y: tableauY + iY * mod}
}

export function getCardTag(card: Card): V.Tag {
  return card.direction === 'Up' ? `card--${cardToASCII(card)}` : 'card--Down'
}
