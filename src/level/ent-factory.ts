import { I16XY, Uint } from '@/ooz'
import { Card, Solitaire, Suit } from '@/solitaire'
import {
  getCardFilmID,
  getFoundationCardXY,
  getStockXY,
  getTableauCardXY,
  getWasteXY,
  level,
  mod,
  SPEnt,
  SPLevelParser,
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
  yield* SPLevelParser.parse(factory, font, level)
}

function newCard(
  factory: SpriteFactory,
  card: Card,
  xy: I16XY,
): Partial<SPEnt> {
  return {
    card,
    sprite: factory.new(getCardFilmID(card), `Card${card.direction}`, { xy }),
  }
}

function* newFoundation(
  factory: SpriteFactory,
): Generator<Partial<SPEnt>> {
  // prev: ComponentSet
  // next: null
  for (const suit of Suit.values) {
    yield {
      sprite: factory.new(`card--Vacant${suit}`, 'Vacancy', {
        xy: getFoundationCardXY(factory.filmByID, suit),
      }),
    }
    yield {
      pile: { type: 'Foundation', suit },
      sprite: factory.new('palette--Light', 'Background', {
        xy: getFoundationCardXY(factory.filmByID, suit),
      }),
    }
  }
}

function* newStock(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): IterableIterator<Partial<SPEnt>> {
  yield {
    vacantStock: true,
    sprite: factory.new('card--VacantStock', 'Vacancy', {
      xy: getStockXY(solitaire, solitaire.stock.length - 1),
    }),
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
      pile: { type: 'Tableau', x: Uint(x) },
      sprite: factory.new('palette--Light', 'Background', {
        xy: getTableauCardXY(factory.filmByID, x, 0),
      }),
    }
    yield {
      sprite: factory.new('card--VacantPile', 'Vacancy', {
        xy: getTableauCardXY(factory.filmByID, x, 0),
      }),
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
      sprite: factory.new('tally--0', 'Patience'),
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
