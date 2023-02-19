import { Immutable, U8 } from '@/oidlib'
import { Layer } from '@/void'

export const SPLayer = Immutable({
  ...Layer,
  Picked: U8(0x02),
  CardUp: U8(0x03),
  CardDown: U8(0x04),
  Patience: U8(0x05),
  Vacancy: U8(0x06),
  Background: U8(0x07),
}) satisfies { [name: string]: U8 }

export type SPLayer = keyof typeof SPLayer

