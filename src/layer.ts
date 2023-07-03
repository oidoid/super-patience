export const Layer = {
  Cursor: 0,
  Picked: 1,
  CardUp: 2,
  CardDown: 3,
  Decal: 5,
  Background: 6,
  Hidden: 7,
} as const
export type Layer = keyof typeof Layer
