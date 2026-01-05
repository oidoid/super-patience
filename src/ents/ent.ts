import type * as V from '@oidoid/void'
import type {Suit} from 'klondike-solitaire'

export type Board = {selected: PickState}
export type CardEnt = V.QueryEnt<'card & sprite'>
export type PatienceTheDemon = object
export type PickState = {
  sprite: V.Sprite
  /** the adjustment to offset future pick inputs by. */
  offset: Readonly<V.XY>
}[]
export type Pile =
  | {type: 'Foundation'; suit: Suit}
  | {type: 'Tableau'; x: number}
  | {type: 'Waste'}
export type PileEnt = V.QueryEnt<'pile & sprite'>

export type PileType = 'Foundation' | 'Tableau' | 'Waste'
export type Tally = {tens: number}
export type VacantStock = object
