import { FilmByID } from '@/atlas-pack';
import { I16XY } from '@/oidlib';
import { Card, Solitaire, Suit } from '@/solitaire';
import {
  SublimeComponentSet,
  SublimeFilmID,
  SublimeLayer,
} from '@/sublime-solitaire';
import { ECS } from '@/void';

export const mod = 8;

const tableauY = 72;
const boardX = 2 * mod;
const boardY = 16;
const hiddenY = -1024;

// to-do: can this be a system or systems? It seems like it's a "board" system
// but has some overlap with CardSystem which calls these functions.

export function setSpritePositionsForLayout(
  ecs: ECS<SublimeComponentSet>,
  filmByID: FilmByID<SublimeFilmID>,
  solitaire: Readonly<Solitaire>,
  time: number,
): void {
  for (const [indexX, column] of solitaire.tableau.entries()) {
    for (const [indexY, card] of column.entries()) {
      const components = ecs.componentsByRef.get(card);
      const xy = getTableauCardXY(filmByID, indexX, indexY);
      components!.sprite.moveTo(xy);
      components!.sprite.layer =
        SublimeLayer[card.direction == 'Up' ? 'CardUp' : 'CardDown'];
      components!.sprite.animate(time, filmByID[getCardFilmID(card)]);
    }
  }
  for (const pillar of solitaire.foundation) {
    for (const [index, card] of pillar.entries()) {
      const components = ecs.componentsByRef.get(card);
      const xy = getFoundationCardXY(filmByID, card.suit);
      components!.sprite.moveTo(xy);
      // change this to downard for everything but top
      const animID = index == (pillar.length - 1)
        ? getCardFilmID(card)
        : 'CardDown';
      components!.sprite.animate(time, filmByID[animID]);
      components!.sprite.layer =
        SublimeLayer[animID == 'CardDown' ? 'CardDown' : 'CardUp'];
    }
  }
  for (const [index, card] of solitaire.stock.entries()) {
    const components = ecs.componentsByRef.get(card);
    components!.sprite.moveTo(getStockXY(solitaire, index));
    components!.sprite.layer =
      SublimeLayer[card.direction == 'Up' ? 'CardUp' : 'CardDown'];
    components!.sprite.animate(time, filmByID[getCardFilmID(card)]);
  }
  for (const [index, card] of solitaire.waste.entries()) {
    const components = ecs.componentsByRef.get(card);
    components!.sprite.moveTo(getWasteXY(solitaire, index));
    let animID: SublimeFilmID;
    if (index >= (solitaire.waste.length - solitaire.drawSize)) {
      animID = getCardFilmID(card);
    } else {
      animID = 'CardDown';
    }
    // Hide waste under the draw reserve. I can't draw them in the correct
    // order since they have identical XYs.
    components!.sprite.layer =
      SublimeLayer[animID == 'CardDown' ? 'CardDown' : 'CardUp'];
    components!.sprite.animate(time, filmByID[animID]);
  }
}

export function getStockXY(
  solitaire: Readonly<Solitaire>,
  indexY: number,
): I16XY {
  return I16XY(
    boardX + 160,
    // All cards in the stock are at the same point and on the same layer. Only
    // the top card should be pickable though so hide the rest off-cam since
    // they're not drawn in the correct order.
    boardY + (solitaire.stock.length - 1 == indexY ? 0 : hiddenY),
  );
}

export function getWasteXY(
  solitaire: Readonly<Solitaire>,
  index: number,
): I16XY {
  const top = solitaire.waste.length - solitaire.drawSize;
  const betterIndex = Math.max(index - top, 0);
  return I16XY(208, boardY + betterIndex * mod);
}

export function getFoundationCardXY(
  filmByID: FilmByID<SublimeFilmID>,
  suit: Suit,
): I16XY {
  const film = filmByID[`CardVacant${suit}`];
  const betterIndexX = { Clubs: 0, Diamonds: 1, Hearts: 2, Spades: 3 }[suit];
  const x = boardX + mod * 4 + betterIndexX * (film.wh.x + mod);
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
