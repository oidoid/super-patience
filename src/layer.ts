export const Layer = <const>{
  Cursor: 0,
  Picked: 1,
  CardUp: 2,
  CardDown: 3,
  Decal: 5,
  Background: 6,
  Hidden: 7
}
export type Layer = keyof typeof Layer
