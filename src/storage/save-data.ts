import { Uint } from '@/ooz'

export type SaveData = { wins: Uint }

export function SaveData(wins: Uint): SaveData {
  return { wins }
}
