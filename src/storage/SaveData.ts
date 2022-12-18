import { Uint } from '@/oidlib';

export type SaveData = { wins: Uint };

export function SaveData(wins: Uint): SaveData {
  return { wins };
}
