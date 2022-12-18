import { AtlasMeta } from '@/atlas-pack';
import { assertExists } from 'std/testing/asserts.ts';
import atlasJSON from '../../assets/atlas.json' assert { type: 'json' };
import { SublimeFilmID } from './SublimeFilmID.ts';

Deno.test('Atlas and FilmIDs are aligned.', () => {
  const atlasMeta = atlasJSON as unknown as AtlasMeta<SublimeFilmID>;
  for (const id of SublimeFilmID.values) {
    assertExists(atlasMeta.filmByID[id], `Atlas missing ${id} FilmID.`);
  }
  for (const id of Object.keys(atlasMeta.filmByID)) {
    assertExists(
      SublimeFilmID.values.has(id as SublimeFilmID),
      `FilmID missing ${id}.`,
    );
  }
});
