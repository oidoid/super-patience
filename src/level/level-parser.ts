import type * as V from '@oidoid/void'

export const parseComponent: V.ComponentHook = (_ent, json, k) => {
  if (json[k] == null) throw Error('no component val')
  switch (k) {
    case 'patienceTheDemon':
    case 'pile':
      return json[k] satisfies V.Ent[typeof k]

    case 'board':
      return {
        cards: undefined,
        piles: undefined,
        selected: [],
        vacantStock: undefined
      } satisfies V.Ent[typeof k]
  }
}
