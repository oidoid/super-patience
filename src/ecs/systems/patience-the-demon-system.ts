import { Film } from '@/atlas-pack'
import { Solitaire } from '@/solitaire'
import { SaveStorage, SPEnt, SuperPatience } from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type PatienceTheDemonEnt = QueryEnt<
  { patienceTheDemon: Record<never, never>; sprite: Sprite },
  typeof query
>

const query = 'patienceTheDemon & sprite'

export class PatienceTheDemonSystem
  implements System<PatienceTheDemonEnt, SPEnt> {
  readonly query = query
  run(ents: ReadonlySet<PatienceTheDemonEnt>, game: SuperPatience): void {
    if (game.pickHandled) return
    // to-do: need notion of handled game so that picks don't bleed.
    // to-do: need notion of system order so that pickable is first.
    if (!game.input.isOffStart('Action')) return

    for (const ent of ents) {
      const { sprite } = ent
      if (sprite.intersectsSprite(game.cursor, game.time)) {
        game.pickHandled = true
        sprite.animate(game.time, nextFilm(game, sprite))
        // to-do: really don't like reaching in and touching cursor or all the way to cursor.bounds.start.
      } else if (sprite.intersectsBounds(game.cursor.bounds.xy)) {
        game.pickHandled = true
        Solitaire.reset(game.solitaire)
        game.saveStorage.save.wins = game.solitaire.wins
        SaveStorage.save(game.saveStorage)
      }
    }
  }
}

function nextFilm(game: Readonly<SuperPatience>, sprite: Sprite): Film {
  const good = sprite.film.id == 'patience-the-demon--Good'
  const id = `patience-the-demon--${good ? 'Evil' : 'Good'}` as const
  return game.filmByID[id]
}
