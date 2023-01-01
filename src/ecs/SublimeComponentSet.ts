import { Card } from '@/solitaire';
import { PileConfig, TallyConfig } from '@/sublime-solitaire';
import { ComponentSet } from '@/void';

export interface SublimeComponentSet extends ComponentSet {
  card: Card;
  pile: PileConfig;
  patienceTheDemon: Record<never, never>;
  vacantStock: Record<never, never>;
  tally: TallyConfig;
}
