import type {Suit} from 'klondike-solitaire'

export type PileConfig =
  | {readonly type: 'Foundation'; readonly suit: Suit}
  | {readonly type: 'Tableau'; readonly x: number}
  | {readonly type: 'Waste'}
