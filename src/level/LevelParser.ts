import { assert, JSONArray, JSONObject, Obj } from '@/oidlib';
import { ComponentSet } from '@/sublime-solitaire';
import { Sprite } from '@/void';
import { SublimeFilmID } from '../assets/SublimeFilmID.ts';

export function parse(json: JSONObject | JSONArray): Partial<ComponentSet> {
  if (Array.isArray(json)) return json.map(parseComponentSet);
  return parseComponentSet(json);
}

function parseComponentSet(obj: JSONObject): Partial<ComponentSet> {
  const set: Partial<ComponentSet> = {};
  for (const [key, val] of Object.entries(obj)) {
    assert(Obj.is(val), `Property ${key} must be an object.`);
    if (key == 'sprite') set[key] = parseSprite(val as JSONObject);
  }
  return set;
}

function parseSprite(obj: JSONObject): Sprite {
  return Sprite();
}

function parseFilmID(id: string): SublimeFilmID {
  assert(
    SublimeFilmID.values.has(id as SublimeFilmID),
    `Unknown film ID "${id}".`,
  );
  return id as SublimeFilmID;
}
