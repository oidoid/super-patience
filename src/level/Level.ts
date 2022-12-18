import { FilmByID } from '@/atlas-pack';
import { I16XY, UnumberMillis } from '@/oidlib';
import { Card, Solitaire, Suit } from '@/solitaire';
import { ECS, Sprite } from '@/void';
import { SublimeFilmID } from '../assets/SublimeFilmID.ts';
import { SublimeSet } from '../ecs/SublimeUpdate.ts';
import { SublimeLayer } from '../sprite/SublimeLayer.ts';

export const mod = 8;

const tableauY = 72;
const boardX = 2 * mod;
const boardY = 16;
const hiddenY = -1024;

export function setSpritePositionsForLayout(
  ecs: ECS<SublimeSet>,
  filmByID: FilmByID<SublimeFilmID>,
  solitaire: Readonly<Solitaire>,
  time: UnumberMillis,
): void {
  for (const [indexX, column] of solitaire.tableau.entries()) {
    for (const [indexY, card] of column.entries()) {
      const components = ecs.componentsByRef.get(card);
      const xy = getTableauCardXY(filmByID, indexX, indexY);
      Sprite.moveTo(components!.sprite, xy);
      Sprite.setLayer(
        components!.sprite,
        SublimeLayer[card.direction == 'Up' ? 'CardUp' : 'CardDown'],
      );
      Sprite.reset(components!.sprite, time, filmByID[getCardFilmID(card)]);
    }
  }
  for (const pillar of solitaire.foundation) {
    for (const [index, card] of pillar.entries()) {
      const components = ecs.componentsByRef.get(card);
      const xy = getFoundationCardXY(filmByID, card.suit);
      Sprite.moveTo(components!.sprite, xy);
      // change this to downard for everything but top
      const animID = index == (pillar.length - 1)
        ? getCardFilmID(card)
        : 'CardDown';
      Sprite.reset(components!.sprite, time, filmByID[animID]);
      Sprite.setLayer(
        components!.sprite,
        SublimeLayer[animID == 'CardDown' ? 'CardDown' : 'CardUp'],
      );
    }
  }
  for (const [index, card] of solitaire.stock.entries()) {
    const components = ecs.componentsByRef.get(card);
    Sprite.moveTo(components!.sprite, getStockXY(solitaire, index));
    Sprite.setLayer(
      components!.sprite,
      SublimeLayer[card.direction == 'Up' ? 'CardUp' : 'CardDown'],
    );
    Sprite.reset(components!.sprite, time, filmByID[getCardFilmID(card)]);
  }
  for (const [index, card] of solitaire.waste.entries()) {
    const components = ecs.componentsByRef.get(card);
    Sprite.moveTo(
      components!.sprite,
      getWasteXY(filmByID, solitaire, index),
    );
    let animID: SublimeFilmID;
    if (
      index >=
        (solitaire.waste.length - solitaire.drawSize)
    ) {
      animID = getCardFilmID(card);
    } else {
      animID = 'CardDown';
    }
    Sprite.setLayer(
      components!.sprite,
      SublimeLayer[animID == 'CardDown' ? 'CardDown' : 'CardUp'],
    ); // could have card-1-2-3 for horizontal ordering to work correctly, could have CardBack for everything below topmost hidden card. tricks i can play here to make layering appear to work correctly for stacked cards with same y. could also do order breaking for horizontal based on left-to-right so that it's consistent.
    Sprite.reset(
      components!.sprite,
      time,
      // hide cards under draw reserve. i can't draw them in the correct order
      filmByID[animID],
    );
  }
}

export function getStockXY(
  solitaire: Readonly<Solitaire>,
  indexY: number,
): I16XY {
  return I16XY(
    boardX,
    // All cards in the stock are at the same point and on the same layer. Only
    // the top card should be pickable so move the rest off-cam.
    boardY + (solitaire.stock.length - 1 == indexY ? 0 : hiddenY),
  );
}

export function getWasteXY(
  filmByID: FilmByID<SublimeFilmID>,
  solitaire: Readonly<Solitaire>,
  index: number,
): I16XY {
  const film = filmByID.CardVacantPile;
  const top = solitaire.waste.length - solitaire.drawSize;
  const betterIndex = Math.max(index - top, 0);
  return I16XY(boardX + mod + film.wh.x, boardY + betterIndex * mod);
}

export function getFoundationCardXY(
  filmByID: FilmByID<SublimeFilmID>,
  suit: Suit,
): I16XY {
  const film = filmByID[`CardVacant${suit}`];
  const betterIndexX = { Clubs: 0, Diamonds: 1, Hearts: 2, Spades: 3 }[suit];
  const x = boardX + 48 + 2 * mod + betterIndexX * (film.wh.x + mod);
  return I16XY(x, boardY);
}

export function getTableauCardXY(
  filmByID: FilmByID<SublimeFilmID>,
  indexX: number,
  indexY: number,
): I16XY {
  const film = filmByID.CardVacantPile;
  const x = boardX + indexX * (film.wh.x + mod);
  return I16XY(x, tableauY + indexY * mod);
}

export function getCardFilmID(card: Card): SublimeFilmID {
  return card.direction == 'Up' ? `Card${Card.toASCII(card)}` : 'CardDown';
}
