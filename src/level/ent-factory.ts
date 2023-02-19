import { I16XY, Uint } from '@/oidlib'
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

// to-do: move min viewport size to JSON.

export function newLevelComponents(
  factory: SpriteFactory,
  font: Font | undefined,
  solitaire: Readonly<Solitaire>,
): Partial<SPEnt>[] {
  // to-do: detect mobile platforms and hide cursor initially.
  // to-do: limit cursor movement to play area.
  return [
    ...newTallies(factory),

    ...newFoundation(factory),
    ...newStock(factory, solitaire),
    ...newTableau(solitaire, factory),
    ...newWaste(solitaire, factory),

    ...SPLevelParser.parse(factory, font, level),
  ]
}

// stacking now but other options are clipbox or four border bits.
// to-do: 9patch

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
      sprite: factory.new(`CardVacant${suit}`, 'Vacancy', {
        xy: getFoundationCardXY(factory.filmByID, suit),
      }),
    }
    yield {
      pile: { type: 'Foundation', suit },
      sprite: factory.new('PaletteLight', 'Background', {
        xy: getFoundationCardXY(factory.filmByID, suit),
      }),
    }
  }
}

function newStock(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): Partial<SPEnt>[] {
  const components: Partial<SPEnt>[] = [{
    vacantStock: true,
    sprite: factory.new('CardVacantStock', 'Vacancy', {
      xy: getStockXY(solitaire, solitaire.stock.length - 1),
    }),
  }]
  for (const [index, card] of solitaire.stock.entries()) {
    components.push(newCard(factory, card, getStockXY(solitaire, index)))
  }
  return components
}

function newTableau(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): Partial<SPEnt>[] {
  const components: Partial<SPEnt>[] = []
  for (const [indexX, pile] of solitaire.tableau.entries()) {
    const x = indexX
    components.push(
      {
        pile: { type: 'Tableau', x: Uint(x) },
        sprite: factory.new('PaletteLight', 'Background', {
          xy: getTableauCardXY(factory.filmByID, x, 0),
        }),
      },
      {
        sprite: factory.new('CardVacantPile', 'Vacancy', {
          xy: getTableauCardXY(factory.filmByID, x, 0),
        }),
      },
    )
    for (const [indexY, card] of pile.entries()) {
      components.push(
        newCard(factory, card, getTableauCardXY(factory.filmByID, x, indexY)),
      )
    }
  }
  return components
}

export const maxTallies = 26

function* newTallies(factory: SpriteFactory): Generator<Partial<SPEnt>> {
  for (let i = 0; i < maxTallies; i++) {
    yield {
      followCam: {
        modulo: { x: mod, y: mod },
        orientation: 'Northeast',
        pad: { x: 0, y: 8 + i * 8 },
      },
      tally: { tens: i },
      sprite: factory.new('Tally0', 'Patience'),
    }
  }
}

function* newWaste(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): Generator<Partial<SPEnt>> {
  for (const [index, card] of solitaire.waste.entries()) {
    const xy = getWasteXY(solitaire, index)
    yield newCard(factory, card, xy)
  }
}
