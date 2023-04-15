import { XY } from '@/ooz'
import { Card, Solitaire, SuitSet } from '@/solitaire'
import {
  getCardFilmID,
  getFoundationCardXY,
  getStockXY,
  getTableauCardXY,
  getWasteXY,
  level,
  mod,
  parseLevel,
  SPEnt,
  SpriteFactory,
} from '@/super-patience'
import { Font } from '@/void'

export function* newLevelComponents(
  factory: SpriteFactory,
  font: Font | undefined,
  solitaire: Readonly<Solitaire>,
): IterableIterator<Partial<SPEnt>> {
  yield* newTallies(factory)
  yield* newFoundation(factory)
  yield* newStock(factory, solitaire)
  yield* newTableau(solitaire, factory)
  yield* newWaste(solitaire, factory)
  yield* parseLevel(factory, font, level)
}

function newCard(factory: SpriteFactory, card: Card, xy: XY): Partial<SPEnt> {
  return {
    card,
    sprites: [
      factory.new(getCardFilmID(card), `Card${card.direction}`, { xy }),
    ],
  }
}

function* newFoundation(factory: SpriteFactory): Generator<Partial<SPEnt>> {
  // prev: ComponentSet
  // next: null
  for (const suit of SuitSet) {
    yield {
      sprites: [factory.new(`card--Vacant${suit}`, 'Vacancy', {
        xy: getFoundationCardXY(factory.filmByID, suit),
      })],
    }
    yield {
      pile: { type: 'Foundation', suit },
      sprites: [factory.new('palette--Light', 'Background', {
        xy: getFoundationCardXY(factory.filmByID, suit),
      })],
    }
  }
}

function* newStock(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): IterableIterator<Partial<SPEnt>> {
  yield {
    vacantStock: true,
    sprites: [factory.new('card--VacantStock', 'Vacancy', {
      xy: getStockXY(solitaire, solitaire.stock.length - 1),
    })],
  }
  for (const [index, card] of solitaire.stock.entries()) {
    yield newCard(factory, card, getStockXY(solitaire, index))
  }
}

function* newTableau(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): IterableIterator<Partial<SPEnt>> {
  for (const [indexX, pile] of solitaire.tableau.entries()) {
    const x = indexX
    yield {
      pile: { type: 'Tableau', x },
      sprites: [factory.new('palette--Light', 'Background', {
        xy: getTableauCardXY(factory.filmByID, x, 0),
      })],
    }
    yield {
      sprites: [factory.new('card--VacantPile', 'Vacancy', {
        xy: getTableauCardXY(factory.filmByID, x, 0),
      })],
    }
    for (const [indexY, card] of pile.entries()) {
      yield newCard(
        factory,
        card,
        getTableauCardXY(factory.filmByID, x, indexY),
      )
    }
  }
}

export const maxTallies = 26

function* newTallies(factory: SpriteFactory): IterableIterator<Partial<SPEnt>> {
  for (let i = 0; i < maxTallies; i++) {
    yield {
      followCam: {
        modulo: { x: mod, y: mod },
        orientation: 'Northeast',
        pad: { x: 0, y: 8 + i * 8 },
      },
      tally: { tens: i },
      sprites: [factory.new('tally--0', 'Patience')],
    }
  }
}

function* newWaste(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): IterableIterator<Partial<SPEnt>> {
  for (const [index, card] of solitaire.waste.entries()) {
    const xy = getWasteXY(solitaire, index)
    yield newCard(factory, card, xy)
  }
}
