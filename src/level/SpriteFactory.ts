import { FilmByID } from '@/atlas-pack';
import { U8 } from '@/oidlib';
import { SublimeFilmID, SublimeLayer } from '@/sublime-solitaire';
import { FilmLUT, Sprite, SpriteProps } from '@/void';

export class SpriteFactory implements FilmLUT {
  readonly #filmByID: FilmByID<SublimeFilmID>;
  readonly layerByID: Readonly<{ [id in SublimeLayer]: U8 }> = SublimeLayer;

  get filmByID(): FilmByID<SublimeFilmID> {
    return this.#filmByID;
  }

  constructor(filmByID: FilmByID<SublimeFilmID>) {
    this.#filmByID = filmByID;
  }

  new(filmID: SublimeFilmID, layer: SublimeLayer, props?: SpriteProps): Sprite {
    return new Sprite(this.#filmByID[filmID], SublimeLayer[layer], props);
  }
}
