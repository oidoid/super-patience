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
    if (game.pickHandled || !game.input.isOffStart('Action')) return
    for (const ent of ents) {
      if (ent.sprite.intersectsSprite(game.cursor, game.time)) { // Tail.
        game.pickHandled = true
        ent.sprite.animate(game.time, nextFilm(game, ent.sprite))
      } else if (ent.sprite.intersectsBounds(game.cursor)) { // Anywhere else.
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
  return game.filmByID[`patience-the-demon--${good ? 'Evil' : 'Good'}`]
}
