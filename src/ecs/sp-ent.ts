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
  & CardEnt
  & PatienceTheDemonEnt
  & PileHitboxEnt
  & TallyEnt
  & VacantStockEnt
