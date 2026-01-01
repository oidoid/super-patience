import * as V from '@oidoid/void'
import {type Card, SuitSet} from 'klondike-solitaire'
import type {CardEnt, PileEnt} from '../ents/ent.ts'
import type {TallyEnt} from '../ents/tally.ts'
import type {VacantStockEnt} from '../ents/vacant-stock.ts'
import {
  getCardTag,
  getFoundationCardXY,
  getStockXY,
  getTableauCardXY,
  getWasteXY,
  mod
} from './level.ts'

export const maxTallies: number = 26

// these are dynamic ents based on the solitaire and tally models. it'd be neat
// to explore extending the parser and generating `EntSchema` below but it'd
// need to sync references to the `v.solitaire` model.

export function* newLevelComponents(v: V.Void): IterableIterator<V.Ent> {
  yield* newTallies(v)
  yield* newFoundation(v)
  yield* newStock(v)
  yield* newTableau(v)
  yield* newWaste(v)
}

function CardEnt(v: V.Void, card: Card, xy: V.XY): CardEnt {
  const sprite = v.pool.default.alloc()
  sprite.tag = getCardTag(card)
  sprite.x = xy.x
  sprite.y = xy.y
  sprite.z = card.direction === 'Up' ? V.Layer.F : V.Layer.E
  return {sprite, card}
}

function* newFoundation(v: V.Void): IterableIterator<V.SpriteEnt | PileEnt> {
  for (const suit of SuitSet) {
    const vacant = v.pool.default.alloc()
    vacant.tag = `card--Vacant${suit}`
    const xy = getFoundationCardXY(v.preload, suit)
    vacant.x = xy.x
    vacant.y = xy.y
    vacant.z = V.Layer.D
    yield {sprite: vacant}
    const palette = v.pool.default.alloc()
    palette.tag = 'palette--Light'
    palette.x = xy.x
    palette.y = xy.y
    palette.z = V.Layer.C
    yield {sprite: palette, pile: {type: 'Foundation', suit}}
  }
}

function* newStock(v: V.Void): IterableIterator<VacantStockEnt | CardEnt> {
  const vacant = v.pool.default.alloc()
  vacant.tag = 'card--VacantStock'
  vacant.z = V.Layer.C
  const xy = getStockXY(v.solitaire, v.solitaire.stock.length - 1)
  vacant.x = xy.x
  vacant.y = xy.y
  yield {id: 'VacantStock', sprite: vacant, vacantStock: {}}
  for (const [i, card] of v.solitaire.stock.entries())
    yield CardEnt(v, card, getStockXY(v.solitaire, i))
}

function* newTableau(
  v: V.Void
): IterableIterator<PileEnt | V.SpriteEnt | CardEnt> {
  for (const [iX, pile] of v.solitaire.tableau.entries()) {
    const x = iX
    const palette = v.pool.default.alloc()
    palette.tag = 'palette--Light'
    palette.z = V.Layer.C
    const xy = getTableauCardXY(v.preload, x, 0)
    palette.x = xy.x
    palette.y = xy.y
    yield {sprite: palette, pile: {type: 'Tableau', x}}
    const vacant = v.pool.default.alloc()
    vacant.tag = 'card--VacantPile'
    vacant.z = V.Layer.D
    vacant.x = xy.x
    vacant.y = xy.y
    yield {sprite: vacant}
    for (const [iY, card] of pile.entries())
      yield CardEnt(v, card, getTableauCardXY(v.preload, x, iY))
  }
}

function* newTallies(v: V.Void): IterableIterator<TallyEnt> {
  for (let i = 0; i < maxTallies; i++) {
    const sprite = v.pool.default.alloc()
    sprite.tag = 'tally--0'
    sprite.z = V.Layer.D
    yield {
      sprite,
      tally: {tens: i},
      hud: {
        modulo: {x: mod, y: mod},
        origin: 'NE',
        margin: {n: 8 + i * 8, s: 8 + i * 8, w: 0, e: 0}
      }
    }
  }
}

function* newWaste(v: V.Void): IterableIterator<CardEnt> {
  for (const [i, card] of v.solitaire.waste.entries())
    yield CardEnt(v, card, getWasteXY(v.solitaire, i))
}
