import { AtlasMeta } from '@/atlas-pack'
import { atlasJSON } from '@/super-patience'
import { assertEquals } from 'std/testing/asserts.ts'

Deno.test('All AtlasMeta collisions empty or singular.', () => {
  const meta = AtlasMeta.fromJSON(atlasJSON)
  for (const film of Object.values(meta.filmByID)) {
    for (const cel of film.cels) {
      assertEquals(
        cel.slices.length === 0 || cel.slices.length === 1,
        true,
        `Cel slice length is greater than one (${cel.slices.length}) for ` +
          `film ${film.id}, cel ${cel.id}.`,
      )
    }
  }
})
