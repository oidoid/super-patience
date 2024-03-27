import type {Atlas, WH, XY} from '@oidoid/void'
import {Card, cardToASCII, Solitaire, type Suit} from 'klondike-solitaire'
import type {SPAnimTag} from '../assets/sp-anim-tag.js'
import type {Game} from '../index.js'
import {Layer} from '../layer.js'

export const mod = 8
export const cardWH: WH = {w: 24, h: 32}
const tableauY = 72
const boardX = 2 * mod
const boardY = 16
const hiddenY = -1024

// to-do: can this be a system or systems? It seems like it's a "board" system
// but has some overlap with CardSystem which calls these functions.

export function invalidateSolitaireSprites(game: Game): void {
  for (const [indexX, column] of game.solitaire.tableau.entries()) {
    for (const [indexY, card] of column.entries()) {
      const sprite = game.spriteByCard.get(card)!
      sprite.xy = getTableauCardXY(game.v.atlas, indexX, indexY)
      sprite.z = Layer[card.direction === 'Up' ? 'CardUp' : 'CardDown']
      sprite.tag = getCardTag(card)
    }
  }
  for (const pillar of game.solitaire.foundation) {
    for (const [index, card] of pillar.entries()) {
      const sprite = game.spriteByCard.get(card)!
      sprite.xy = getFoundationCardXY(game.v.atlas, card.suit)
      // Force all cards except the top to downward since they're in the exact
      // same position and are not layered correctly for rendering.
      const tag = index === pillar.length - 1 ? getCardTag(card) : 'card--Down'
      sprite.z = Layer[tag === 'card--Down' ? 'CardDown' : 'CardUp']
      sprite.tag = tag
    }
  }
  for (const [index, card] of game.solitaire.stock.entries()) {
    const sprite = game.spriteByCard.get(card)!
    sprite.xy = getStockXY(game.solitaire, index)
    sprite.z = Layer[card.direction === 'Up' ? 'CardUp' : 'CardDown']
    sprite.tag = getCardTag(card)
  }
  for (const [index, card] of game.solitaire.waste.entries()) {
    const sprite = game.spriteByCard.get(card)!
    sprite.xy = getWasteXY(game.solitaire, index)
    let tag: SPAnimTag
    if (index >= game.solitaire.waste.length - game.solitaire.drawSize) {
      tag = getCardTag(card)
    } else tag = 'card--Down'
    // Hide waste under the draw reserve. I can't draw them in the correct
    // order since they have identical XYs.
    sprite.z = Layer[tag === 'card--Down' ? 'CardDown' : 'CardUp']
    sprite.tag = tag
  }
}

export function getStockXY(solitaire: Readonly<Solitaire>, indexY: number): XY {
  return {
    x: boardX + 160,
    // All cards in the stock are at the same point and on the same layer. Only
    // the top card should be pickable though so hide the rest off-cam since
    // they're not drawn in the correct order.
    y: boardY + (solitaire.stock.length - 1 === indexY ? 0 : hiddenY)
  }
}

export function getWasteXY(solitaire: Readonly<Solitaire>, index: number): XY {
  const top = solitaire.waste.length - solitaire.drawSize
  const mul = Math.max(index - top, 0)
  return {x: 208, y: boardY + mul * mod}
}

export function getFoundationCardXY(atlas: Atlas<SPAnimTag>, suit: Suit): XY {
  const anim = atlas[`card--Vacant${suit}`]
  const mul = {Clubs: 0, Diamonds: 1, Hearts: 2, Spades: 3}[suit]
  return {x: boardX + mod * 4 + mul * (anim.w + mod), y: boardY}
}

export function getTableauCardXY(
  atlas: Atlas<SPAnimTag>,
  indexX: number,
  indexY: number
): XY {
  const anim = atlas['card--VacantPile']
  return {x: boardX + indexX * (anim.w + mod), y: tableauY + indexY * mod}
}

export function getCardTag(card: Card): SPAnimTag {
  return card.direction === 'Up' ? `card--${cardToASCII(card)}` : 'card--Down'
}
