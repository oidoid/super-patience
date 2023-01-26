import { assert } from '@/oidlib'
import { SPComponentSet, SpriteFactory } from '@/super-patience'
import { ComponentSetJSON, LevelParser } from '@/void'

interface SPComponentSetJSON extends ComponentSetJSON {
  readonly pile?: PileConfigJSON
  readonly patienceTheDemon?: Record<never, never>
}

interface PileConfigJSON {
  type: string
}

export namespace SPLevelParser {
  export function parse(
    factory: SpriteFactory,
    json: readonly SPComponentSetJSON[],
  ): Partial<SPComponentSet>[] {
    return json.map((setJSON) => parseComponentSet(factory, setJSON))
  }
}

function parseComponentSet(
  factory: SpriteFactory,
  json: SPComponentSetJSON,
): Partial<SPComponentSet> {
  const set: Partial<SPComponentSet> = {}
  for (const [key, val] of Object.entries(json)) {
    const component = LevelParser.parseComponent(factory, key, val)
    if (component != null) {
      // deno-lint-ignore no-explicit-any
      set[key as keyof SPComponentSetJSON] = component as any
      continue
    }
    switch (key) { // to-do: fail when missing types.
      case 'pile':
        assert(
          json.pile?.type == 'Waste',
          `Unsupported pile type "${json.pile?.type}".`,
        )
        set[key] = { type: 'Waste' }
        break
      case 'patienceTheDemon':
        set[key] = {}
        break
      case '//':
      case 'name':
        break
      default:
        throw Error(`Unsupported level config type "${key}".`)
    }
  }
  return set
}
