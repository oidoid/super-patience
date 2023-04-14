import { Film } from '@/atlas-pack'
import { solitaireReset } from '@/solitaire'
import { SPEnt, SuperPatience } from '@/super-patience'
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
    if (game.pickHandled || !game.input.isOffStart('Action')) return
    for (const ent of ents) {
      if (game.cursor.hits(ent.sprite.hitbox)) { // Tail.
        game.pickHandled = true
        ent.sprite.animate(game.time, nextFilm(game, ent.sprite))
      } else if (game.cursor.hits(ent.sprite.bounds)) { // Anywhere else.
        game.pickHandled = true
        solitaireReset(game.solitaire)
        game.saveStorage.data.wins = game.solitaire.wins
        game.saveStorage.save()
      }
    }
  }
}

function nextFilm(game: Readonly<SuperPatience>, sprite: Sprite): Film {
  const good = sprite.film.id === 'patience-the-demon--Good'
  return game.filmByID[`patience-the-demon--${good ? 'Evil' : 'Good'}`]
}
