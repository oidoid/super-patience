import type * as V from '@oidoid/void'
import type {Card, Solitaire} from 'klondike-solitaire'
// biome-ignore lint/correctness/useJsonImportAttributes:;
import type gameJSON from '../assets/void.game.json'
import type {
  Board,
  CardEnt,
  PatienceTheDemon,
  Pile,
  PileEnt,
  Tally,
  VacantStock
} from '../ents/ent.ts'
import type {VacantStockEnt} from '../ents/vacant-stock.ts'
import type {
  BoardSchema,
  PatienceTheDemonSchema,
  PileSchema
} from '../level/level-schema.ts'

declare module '@oidoid/void' {
  interface Ent {
    board?: Board
    card?: Card
    patienceTheDemon?: PatienceTheDemon
    pile?: Pile
    tally?: Tally
    vacantStock?: VacantStock
  }

  interface EntSchema {
    board?: BoardSchema
    patienceTheDemon?: PatienceTheDemonSchema
    pile?: PileSchema
  }

  interface Loader {
    cards: CardEnt[]
    piles: PileEnt[]
    vacantStock: VacantStockEnt | undefined
  }

  interface Zoo {
    end: Set<Ent>
  }

  interface ReturnTag {
    // biome-ignore lint/style/useShorthandFunctionType:;
    (): keyof typeof gameJSON.atlas.anim
  }

  interface Void {
    solitaire: Solitaire
    spriteByCard: Map<Card, V.Sprite>
  }
}
