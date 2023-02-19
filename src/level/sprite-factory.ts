import { FilmByID } from '@/atlas-pack'
import { U8 } from '@/ooz'
import { SPFilmID, SPLayer } from '@/super-patience'
import { FilmLUT, Sprite, SpriteProps } from '@/void'

export class SpriteFactory implements FilmLUT {
  readonly #filmByID: FilmByID<SPFilmID>
  readonly layerByID: Readonly<{ [id in SPLayer]: U8 }> = SPLayer

  get filmByID(): FilmByID<SPFilmID> {
    return this.#filmByID
  }

  constructor(filmByID: FilmByID<SPFilmID>) {
    this.#filmByID = filmByID
  }

  new(filmID: SPFilmID, layer: SPLayer, props?: SpriteProps): Sprite {
    return new Sprite(this.#filmByID[filmID], SPLayer[layer], props)
  }
}
