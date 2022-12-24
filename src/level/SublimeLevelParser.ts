import { SpriteFactory, SublimeComponentSet } from '@/sublime-solitaire';
import { ComponentSetJSON, LevelParser } from '@/void';

interface SublimeComponentSetJSON extends ComponentSetJSON {
  readonly patienceTheDemon?: Record<never, never>;
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
      case 'patienceTheDemon':
        set[key] = {};
        break;
    }
  }
  return set;
}
