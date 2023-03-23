import { FilmByID } from '@/atlas-pack'
import { I16XY } from '@/ooz'
import { Card, Solitaire, Suit } from '@/solitaire'
import { SPEnt, SPFilmID, SPLayer } from '@/super-patience'
import { ECS } from '@/void'

export const mod = 8

const tableauY = 72
const boardX = 2 * mod
const boardY = 16
const hiddenY = -1024

// to-do: can this be a system or systems? It seems like it's a "board" system
// but has some overlap with CardSystem which calls these functions.

export function invalidateSolitaireSprites(
  ecs: ECS<SPEnt>,
  filmByID: FilmByID<SPFilmID>,
  solitaire: Readonly<Solitaire>,
  time: number,
): void {
  for (const [indexX, column] of solitaire.tableau.entries()) {
    for (const [indexY, card] of column.entries()) {
      const ent = ecs.get(card)
      const xy = getTableauCardXY(filmByID, indexX, indexY)
      ent.sprite!.moveTo(xy)
      ent.sprite!.layer =
        SPLayer[card.direction == 'Up' ? 'CardUp' : 'CardDown']
      ent.sprite!.animate(time, filmByID[getCardFilmID(card)])
    }
  }
  for (const pillar of solitaire.foundation) {
    for (const [index, card] of pillar.entries()) {
      const ent = ecs.get(card)
      ent.sprite!.moveTo(getFoundationCardXY(filmByID, card.suit))
      // Force all cards except the top to downward since they're in the exact
      // same position and are not layered correctly for rendering.
      const animID = index == (pillar.length - 1)
        ? getCardFilmID(card)
        : 'card--Down'
      ent.sprite!.animate(time, filmByID[animID])
      ent.sprite!.layer =
        SPLayer[animID == 'card--Down' ? 'CardDown' : 'CardUp']
    }
  }
  for (const [index, card] of solitaire.stock.entries()) {
    const ent = ecs.get(card)
    ent.sprite!.moveTo(getStockXY(solitaire, index))
    ent.sprite!.layer = SPLayer[card.direction == 'Up' ? 'CardUp' : 'CardDown']
    ent.sprite!.animate(time, filmByID[getCardFilmID(card)])
  }
  for (const [index, card] of solitaire.waste.entries()) {
    const ent = ecs.get(card)
    ent.sprite!.moveTo(getWasteXY(solitaire, index))
    let animID: SPFilmID
    if (index >= (solitaire.waste.length - solitaire.drawSize)) {
      animID = getCardFilmID(card)
    } else animID = 'card--Down'
    // Hide waste under the draw reserve. I can't draw them in the correct
    // order since they have identical XYs.
    ent.sprite!.layer = SPLayer[animID == 'card--Down' ? 'CardDown' : 'CardUp']
    ent.sprite!.animate(time, filmByID[animID])
  }
}

export function getStockXY(
  solitaire: Readonly<Solitaire>,
  indexY: number,
): I16XY {
  return new I16XY(
    boardX + 160,
    // All cards in the stock are at the same point and on the same layer. Only
    // the top card should be pickable though so hide the rest off-cam since
    // they're not drawn in the correct order.
    boardY + (solitaire.stock.length - 1 == indexY ? 0 : hiddenY),
  )
}

export function getWasteXY(
  solitaire: Readonly<Solitaire>,
  index: number,
): I16XY {
  const top = solitaire.waste.length - solitaire.drawSize
  const betterIndex = Math.max(index - top, 0)
  return new I16XY(208, boardY + betterIndex * mod)
}

export function getFoundationCardXY(
  filmByID: FilmByID<SPFilmID>,
  suit: Suit,
): I16XY {
  const film = filmByID[`card--Vacant${suit}`]
  const betterIndexX = { Clubs: 0, Diamonds: 1, Hearts: 2, Spades: 3 }[suit]
  const x = boardX + mod * 4 + betterIndexX * (film.wh.x + mod)
  return new I16XY(x, boardY)
}

export function getTableauCardXY(
  filmByID: FilmByID<SPFilmID>,
  indexX: number,
  indexY: number,
): I16XY {
  const film = filmByID['card--VacantPile']
  const x = boardX + indexX * (film.wh.x + mod)
  return new I16XY(x, tableauY + indexY * mod)
}

export function getCardFilmID(card: Card): SPFilmID {
  return card.direction == 'Up' ? `card--${Card.toASCII(card)}` : 'card--Down'
}
