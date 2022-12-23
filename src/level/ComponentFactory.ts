import { I16XY, Uint } from '@/oidlib';
import { Card, Solitaire, Suit } from '@/solitaire';
import {
  ComponentSet,
  getCardFilmID,
  getFoundationCardXY,
  getStockXY,
  getTableauCardXY,
  getWasteXY,
  mod,
  SpriteFactory,
} from '@/sublime-solitaire';
import { I4XY } from '../../../oidlib/src/2d/XY.ts';

export function newLevelComponents(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): Partial<ComponentSet>[] {
  return [
    ...newBackground(factory),
    newCursor(factory),
    newPatienceTheDemon(factory),
    ...newTallies(factory),

    ...newFoundation(factory),
    ...newStock(factory, solitaire),
    ...newTableau(solitaire, factory),
    ...newWaste(solitaire, factory),
  ];
}

// to-do: explore JSON format. This example below could be plain JSON.
// to-do: 9patch
function newBackground(factory: SpriteFactory): Partial<ComponentSet>[] {
  // stacking now but other options are clipbox or four border bits.
  return [{
    followCam: { fill: 'XY', orientation: 'Northwest' },
    sprite: factory.new('PaletteDark', 'Background', { includeHeight: true }),
  }, {
    followCam: { orientation: 'Northwest' },
    sprite: factory.new('Corner', 'Background', { flip: '' }),
  }, {
    followCam: { orientation: 'Northeast' },
    sprite: factory.new('Corner', 'Background', { flip: 'X' }),
  }, {
    followCam: { orientation: 'Southeast' },
    sprite: factory.new('Corner', 'Background', { flip: 'XY' }),
  }, {
    followCam: { orientation: 'Southwest' },
    sprite: factory.new('Corner', 'Background', { flip: 'Y' }),
  }, {
    followCam: { fill: 'XY', orientation: 'Northwest', pad: I16XY(1, 1) },
    sprite: factory.new(
      'Grid',
      'Background',
      { start: I16XY(1, 1), includeHeight: true, wrap: I4XY(-1, -1) },
    ),
  }];
}

function newCard(
  factory: SpriteFactory,
  card: Card,
  xy: I16XY,
): Partial<ComponentSet> {
  return {
    card,
    sprite: factory.new(getCardFilmID(card), `Card${card.direction}`, {
      start: xy,
    }),
  };
}

function newCursor(
  factory: SpriteFactory,
): Partial<ComponentSet> {
  return {
    cursor: {
      pick: factory.filmByID.CursorPick,
      point: factory.filmByID.CursorPoint,
    },
    followPoint: {},
    sprite: factory.new('CursorPoint', 'Cursor', {
      start: I16XY(-128, -128),
    }),
  };
}

function* newFoundation(
  factory: SpriteFactory,
): Generator<Partial<ComponentSet>> {
  // prev: ComponentSet
  // next: null
  for (const suit of Suit.values) {
    yield {
      sprite: factory.new(`CardVacant${suit}`, 'Vacancy', {
        start: getFoundationCardXY(factory.filmByID, suit),
      }),
    };
    yield {
      pile: { type: 'Foundation', suit },
      sprite: factory.new('PaletteAlpha', 'Vacancy', {
        start: getFoundationCardXY(factory.filmByID, suit),
      }),
    };
  }
}

function newPatienceTheDemon(factory: SpriteFactory): Partial<ComponentSet> {
  return {
    followCam: {
      modulo: I16XY(mod, mod),
      orientation: 'Northeast',
      pad: I16XY(3 * mod, 2 * mod),
    },
    patienceTheDemon: {},
    sprite: factory.new('PatienceTheDemonGood', 'Patience'),
  };
}

function newStock(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): Partial<ComponentSet>[] {
  const components: Partial<ComponentSet>[] = [{
    vacantStock: {},
    sprite: factory.new('CardVacantPile', 'Vacancy', {
      start: getStockXY(solitaire, solitaire.stock.length - 1),
    }),
  }];
  for (const [index, card] of solitaire.stock.entries()) {
    components.push(newCard(factory, card, getStockXY(solitaire, index)));
  }
  return components;
}

function newTableau(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): Partial<ComponentSet>[] {
  const components: Partial<ComponentSet>[] = [];
  for (const [indexX, pile] of solitaire.tableau.entries()) {
    const x = indexX;
    components.push(
      {
        pile: { type: 'Tableau', x: Uint(x) },
        sprite: factory.new('PaletteAlpha', 'Vacancy', {
          start: getTableauCardXY(factory.filmByID, x, 0),
        }),
      },
      {
        sprite: factory.new('CardVacantPile', 'Vacancy', {
          start: getTableauCardXY(factory.filmByID, x, 0),
        }),
      },
    );
    for (const [indexY, card] of pile.entries()) {
      components.push(
        newCard(factory, card, getTableauCardXY(factory.filmByID, x, indexY)),
      );
    }
  }
  return components;
}

function* newTallies(factory: SpriteFactory): Generator<Partial<ComponentSet>> {
  for (let i = 0; i < 26; i++) {
    yield {
      followCam: {
        modulo: I16XY(mod, mod),
        orientation: 'Northeast',
        pad: I16XY(8, 8 + i * 8),
      },
      tally: { tens: i },
      sprite: factory.new('Tally0', 'Patience'),
    };
  }
}

function* newWaste(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): Generator<Partial<ComponentSet>> {
  for (const [index, card] of solitaire.waste.entries()) {
    const xy = getWasteXY(factory.filmByID, solitaire, index);
    yield newCard(factory, card, xy);
  }
}
