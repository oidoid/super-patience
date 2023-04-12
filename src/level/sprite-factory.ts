import { FilmByID } from '@/atlas-pack'
import { SPFilmID, SPLayer } from '@/super-patience'
import { FilmLUT, Sprite, SpriteProps } from '@/void'

export class SpriteFactory implements FilmLUT {
  readonly #filmByID: FilmByID<SPFilmID>
  readonly layerByID: Readonly<{ [id in SPLayer]: number }> = SPLayer

  constructor(filmByID: FilmByID<SPFilmID>) {
    this.#filmByID = filmByID
  }

  get filmByID(): FilmByID<SPFilmID> {
    return this.#filmByID
  }

  new(filmID: SPFilmID, layer: SPLayer, props?: SpriteProps): Sprite {
    return new Sprite(this.#filmByID[filmID], SPLayer[layer], props)
  }
}
