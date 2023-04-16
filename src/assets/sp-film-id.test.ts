import { Atlas } from '@/atlas-pack'
import { SPFilmID } from '@/super-patience'
import { assertExists } from 'std/testing/asserts.ts'
import atlasJSON from '../../assets/atlas.json' assert { type: 'json' }
import { SPFilmIDSet } from './sp-film-id.ts'

Deno.test('Atlas and FilmIDs are aligned.', () => {
  const atlas = atlasJSON as unknown as Atlas<SPFilmID>
  for (const id of SPFilmIDSet) {
    assertExists(atlas.filmByID[id], `Atlas missing ${id} FilmID.`)
  }
  for (const id of Object.keys(atlas.filmByID)) {
    assertExists(SPFilmIDSet.has(id as SPFilmID), `FilmID missing ${id}.`)
  }
})
