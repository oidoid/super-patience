import { Card } from '@/solitaire'
import { PileConfig, TallyConfig } from '@/super-patience'
import { ComponentSet } from '@/void'

export interface SPComponentSet extends ComponentSet {
  card: Card
  pile: PileConfig
  patienceTheDemon: Record<never, never>
  vacantStock: Record<never, never>
  tally: TallyConfig
}
