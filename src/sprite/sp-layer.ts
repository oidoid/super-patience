import { Layer } from '@/void'

export const SPLayer = {
  ...Layer,
  Picked: 0x02,
  CardUp: 0x03,
  CardDown: 0x04,
  Patience: 0x05,
  Vacancy: 0x06,
  Background: 0x07,
} satisfies { [name: string]: number }

export type SPLayer = keyof typeof SPLayer
