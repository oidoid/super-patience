import type {StandardButton, Void, XY} from '@oidoid/void'
import {Card, Solitaire, SuitSet} from 'klondike-solitaire'
import type {Tag} from '../config.js'
import type {Ent} from '../ecs/ent.js'
import {Layer} from '../layer.js'
import {parseLevel} from './level-parser.js'
import {
  getCardTag,
  getFoundationCardXY,
  getStockXY,
  getTableauCardXY,
  getWasteXY,
  mod
} from './level.js'

export const maxTallies = 26

export function* newLevelComponents(
  v: Void<Tag, StandardButton>,
  solitaire: Solitaire
): IterableIterator<Partial<Ent>> {
  yield* newTallies(v)
  yield* newFoundation(v)
  yield* newStock(v, solitaire)
  yield* newTableau(v, solitaire)
  yield* newWaste(v, solitaire)
  yield* parseLevel(v.atlas)
}

function newCard(
  v: Void<Tag, StandardButton>,
  card: Card,
  xy: XY
): Partial<Ent> {
  const sprite = v.sprite(getCardTag(card))
  sprite.z = Layer[`Card${card.direction}`]
  sprite.xy = xy
  return {card, sprite}
}

function* newFoundation(v: Void<Tag, StandardButton>): Generator<Partial<Ent>> {
  for (const suit of SuitSet) {
    const vacant = v.sprite(`card--Vacant${suit}`)
    vacant.xy = getFoundationCardXY(v.atlas, suit)
    vacant.z = Layer.Decal
    yield {sprite: vacant}
    const palette = v.sprite('palette--Light')
    palette.xy = getFoundationCardXY(v.atlas, suit)
    palette.z = Layer['Background']
    yield {pile: {type: 'Foundation', suit}, sprite: palette}
  }
}

function* newStock(
  v: Void<Tag, StandardButton>,
  solitaire: Solitaire
): IterableIterator<Partial<Ent>> {
  const vacant = v.sprite('card--VacantStock')
  vacant.z = Layer.Decal
  vacant.xy = getStockXY(solitaire, solitaire.stock.length - 1)
  yield {vacantStock: {}, sprite: vacant}
  for (const [index, card] of solitaire.stock.entries()) {
    yield newCard(v, card, getStockXY(solitaire, index))
  }
}

function* newTableau(
  v: Void<Tag, StandardButton>,
  solitaire: Solitaire
): IterableIterator<Partial<Ent>> {
  for (const [indexX, pile] of solitaire.tableau.entries()) {
    const x = indexX
    const palette = v.sprite('palette--Light')
    palette.z = Layer.Background
    palette.xy = getTableauCardXY(v.atlas, x, 0)
    yield {pile: {type: 'Tableau', x}, sprite: palette}
    const vacant = v.sprite('card--VacantPile')
    vacant.z = Layer.Decal
    vacant.xy = getTableauCardXY(v.atlas, x, 0)
    yield {sprite: vacant}
    for (const [indexY, card] of pile.entries()) {
      yield newCard(v, card, getTableauCardXY(v.atlas, x, indexY))
    }
  }
}

function* newTallies(
  v: Void<Tag, StandardButton>
): IterableIterator<Partial<Ent>> {
  for (let i = 0; i < maxTallies; i++) {
    const sprite = v.sprite('tally--0')
    sprite.z = Layer.Decal
    yield {
      followCam: {
        modulo: {x: mod, y: mod},
        orientation: 'Northeast',
        pad: {x: 0, y: 8 + i * 8}
      },
      tally: {tens: i},
      sprite
    }
  }
}

function* newWaste(
  v: Void<Tag, StandardButton>,
  solitaire: Solitaire
): IterableIterator<Partial<Ent>> {
  for (const [index, card] of solitaire.waste.entries()) {
    const xy = getWasteXY(solitaire, index)
    yield newCard(v, card, xy)
  }
}
