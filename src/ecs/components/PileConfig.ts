import { Uint } from '@/oidlib';
import { Suit } from '@/solitaire';

export type PileConfig = Readonly<
  { type: 'Foundation'; suit: Suit } | { type: 'Tableau'; x: Uint } | {
    type: 'Waste';
  }
>;
