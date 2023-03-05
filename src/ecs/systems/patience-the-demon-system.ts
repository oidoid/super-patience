import { Film } from '@/atlas-pack'
import { Solitaire } from '@/solitaire'
import { SaveStorage, SPEnt, SPRunState } from '@/super-patience'
import { QueryToEnt, Sprite, System } from '@/void'

export type PatienceTheDemonEnt = QueryToEnt<
  { patienceTheDemon: Record<never, never>; sprite: Sprite },
  typeof query
>

const query = 'patienceTheDemon & sprite'

export class PatienceTheDemonSystem
  implements System<PatienceTheDemonEnt, SPEnt> {
  readonly query = query
  run(ents: ReadonlySet<PatienceTheDemonEnt>, state: SPRunState): void {
    if (state.pickHandled) return
    // to-do: need notion of handled state so that picks don't bleed.
    // to-do: need notion of system order so that pickable is first.
    if (!state.input.isOffStart('Action')) return

    for (const ent of ents) {
      const { sprite } = ent
      if (sprite.intersectsSprite(state.cursor, state.time)) {
        state.pickHandled = true
        sprite.animate(state.time, nextFilm(state, sprite))
        // to-do: really don't like reaching in and touching cursor or all the way to cursor.bounds.start.
      } else if (sprite.intersectsBounds(state.cursor.bounds.xy)) {
        state.pickHandled = true
        Solitaire.reset(state.solitaire)
        state.saveStorage.save.wins = state.solitaire.wins
        SaveStorage.save(state.saveStorage)
      }
    }
  }
}

function nextFilm(update: Readonly<SPRunState>, sprite: Sprite): Film {
  const good = sprite.film.id == 'patience-the-demon--Good'
  const id = `patience-the-demon--${good ? 'Evil' : 'Good'}` as const
  return update.filmByID[id]
}
