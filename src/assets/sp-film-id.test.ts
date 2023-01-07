import { AtlasMeta } from '@/atlas-pack';
import { SPFilmID } from '@/super-patience';
import { assertExists } from 'std/testing/asserts.ts';
import atlasJSON from '../../assets/atlas.json' assert { type: 'json' };

Deno.test('Atlas and FilmIDs are aligned.', () => {
  const atlasMeta = atlasJSON as unknown as AtlasMeta<SPFilmID>;
  for (const id of SPFilmID.values) {
    assertExists(atlasMeta.filmByID[id], `Atlas missing ${id} FilmID.`);
  }
  for (const id of Object.keys(atlasMeta.filmByID)) {
    assertExists(SPFilmID.values.has(id as SPFilmID), `FilmID missing ${id}.`);
  }
});
