import { assert } from '@/oidlib';
import { SpriteFactory, SublimeComponentSet } from '@/sublime-solitaire';
import { ComponentSetJSON, LevelParser } from '@/void';

interface SublimeComponentSetJSON extends ComponentSetJSON {
  readonly pile?: PileConfigJSON;
  readonly patienceTheDemon?: Record<never, never>;
}

interface PileConfigJSON {
  type: string;
}

export namespace SublimeLevelParser {
  export function parse(
    factory: SpriteFactory,
    json: readonly SublimeComponentSetJSON[],
  ): Partial<SublimeComponentSet>[] {
    return json.map((setJSON) => parseComponentSet(factory, setJSON));
  }
}

function parseComponentSet(
  factory: SpriteFactory,
  json: SublimeComponentSetJSON,
): Partial<SublimeComponentSet> {
  const set: Partial<SublimeComponentSet> = {};
  for (const [key, val] of Object.entries(json)) {
    const component = LevelParser.parseComponent(factory, key, val);
    if (component != null) {
      set[key as keyof SublimeComponentSetJSON] = component as any;
      continue;
    }
    switch (key) { // to-do: fail when missing types.
      case 'pile':
        assert(
          json.pile?.type == 'Waste',
          `Unsupported pile type "${json.pile?.type}".`,
        );
        set[key] = { type: 'Waste' };
        break;
      case 'patienceTheDemon':
        set[key] = {};
        break;
      case '//':
      case 'name':
        break;
      default:
        throw Error(`Unsupported level config type "${key}".`);
    }
  }
  return set;
}
