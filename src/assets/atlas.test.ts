import { Atlas } from '@/atlas-pack'
import { atlasJSON } from '@/super-patience'
import { assertEquals } from 'std/testing/asserts.ts'

Deno.test('All Atlas hitboxes are empty or singular.', () => {
  const atlas = Atlas.fromJSON(atlasJSON)
  for (const film of Object.values(atlas.filmByID)) {
    for (const cel of film.cels) {
      assertEquals(
        cel.slices.length === 0 || cel.slices.length === 1,
        true,
        `Only up to one slice allowed per cel; ${cel.slices.length}  for ` +
          `film ${film.id}, cel ${cel.id}.`,
      )
    }
  }
})
