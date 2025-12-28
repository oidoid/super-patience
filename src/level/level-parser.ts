import * as V from '@oidoid/void'

export function parseLevel(
  json: Readonly<V.LevelSchema>,
  pools: Readonly<V.PoolMap>,
  atlas: Readonly<V.Atlas>
): V.Level {
  return V.parseLevel(json, pools, parseComponent, atlas)
}

/** @internal */
export const parseComponent: V.ComponentHook = (_ent, json, k) => {
  if (json[k] == null) throw Error('no component val')
  switch (k) {
    case 'cam':
    case 'draw':
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
