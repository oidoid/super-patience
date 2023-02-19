import { Solitaire } from '@/solitaire'
import { SaveStorage, SPEnt, SPFilmID } from '@/super-patience'
import { RunState, Sprite } from '@/void'

export interface SPRunState extends RunState<SPEnt, SPFilmID> {
  readonly cursor: Sprite
  readonly solitaire: Solitaire
  readonly saveStorage: SaveStorage
}
