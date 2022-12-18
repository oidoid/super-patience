import { I16XY, I4, Uint } from '@/oidlib';
import { Card, Solitaire, Suit } from '@/solitaire';
import {
  getCardFilmID,
  getFoundationCardXY,
  getStockXY,
  getTableauCardXY,
  getWasteXY,
  mod,
  SpriteFactory,
  SublimeSet,
} from '@/sublime-solitaire';

export function newLevelComponents(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): Partial<SublimeSet>[] {
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
function newBackground(factory: SpriteFactory): Partial<SublimeSet>[] {
  // stacking now but other options are clipbox or four border bits.
  return [{
    followCam: { fill: 'XY', orientation: 'Northwest' },
    sprite: factory.new('PaletteMid', 'Background', { layerSuborder: 'Start' }),
  }, {
    followCam: { orientation: 'Northwest' },
    sprite: factory.new('PaletteMid', 'Background', { wh: I16XY(2, 2) }),
  }, {
    followCam: { orientation: 'Northeast' },
    sprite: factory.new('PaletteMid', 'Background', { wh: I16XY(2, 2) }),
  }, {
    followCam: { orientation: 'Southeast' },
    sprite: factory.new('PaletteMid', 'Background', { wh: I16XY(2, 2) }),
  }, {
    followCam: { orientation: 'Southwest' },
    sprite: factory.new('PaletteMid', 'Background', { wh: I16XY(2, 2) }),
  }, {
    followCam: { fill: 'XY', orientation: 'Northwest', pad: I16XY(1, 1) },
    sprite: factory.new(
      'PaletteLight',
      'Background',
      {
        start: I16XY(1, 1),
        layerSuborder: 'Start',
        wrapX: I4(-1),
        wrapY: I4(-1),
      },
    ),
  }];
}

function newCard(
  factory: SpriteFactory,
  card: Card,
  xy: I16XY,
): Partial<SublimeSet> {
  return {
    card,
    sprite: factory.new(getCardFilmID(card), `Card${card.direction}`, {
      start: xy,
    }),
  };
}

function newCursor(
  factory: SpriteFactory,
): Partial<SublimeSet> {
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

function newFoundation(
  factory: SpriteFactory,
): Partial<SublimeSet>[] {
  const components: Partial<SublimeSet>[] = [];
  // prev: ComponentSet
  // next: null
  for (const suit of Suit.values) {
    components.push({
      sprite: factory.new(`CardVacant${suit}`, 'Vacancy', {
        start: getFoundationCardXY(factory.filmByID, suit),
      }),
    }, {
      pile: { type: 'Foundation', suit },
      sprite: factory.new('PaletteAlpha', 'Vacancy', {
        start: getFoundationCardXY(factory.filmByID, suit),
      }),
    });
  }
  return components;
}

function newPatienceTheDemon(factory: SpriteFactory): Partial<SublimeSet> {
  return {
    followCam: {
      modulo: I16XY(mod, mod),
      orientation: 'Northeast',
      pad: I16XY(2 * mod, 2 * mod),
    },
    patienceTheDemon: {},
    sprite: factory.new('PatienceTheDemonGood', 'Patience'),
  };
}

function newStock(
  factory: SpriteFactory,
  solitaire: Readonly<Solitaire>,
): Partial<SublimeSet>[] {
  const components: Partial<SublimeSet>[] = [{
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
): Partial<SublimeSet>[] {
  const components: Partial<SublimeSet>[] = [];
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

function newTallies(factory: SpriteFactory): Partial<SublimeSet>[] {
  const tallies: Partial<SublimeSet>[] = [];
  for (let i = 0; i < 26; i++) {
    tallies.push({
      followCam: {
        // modulo: I16XY(mod, mod),
        orientation: 'Northeast',
        pad: I16XY(4, 4 + i * 8),
      },
      tally: { tens: i },
      sprite: factory.new('Tally0', 'Patience'),
    });
  }
  return tallies;
}

function newWaste(
  solitaire: Readonly<Solitaire>,
  factory: SpriteFactory,
): Partial<SublimeSet>[] {
  const components = [];
  for (const [index, card] of solitaire.waste.entries()) {
    components.push(
      newCard(factory, card, getWasteXY(factory.filmByID, solitaire, index)),
    );
  }
  return components;
}
