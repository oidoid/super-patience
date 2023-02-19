import {
  CardEnt,
  PatienceTheDemonEnt,
  PileHitboxEnt,
  TallyEnt,
  VacantStockEnt,
} from '@/super-patience'
import { VoidEnt } from '@/void'

export type SPEnt =
  & VoidEnt
  & Required<CardEnt>
  & Required<PatienceTheDemonEnt>
  & Required<PileHitboxEnt>
  & Required<TallyEnt>
  & Required<VacantStockEnt>
