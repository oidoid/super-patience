import { FilmByID } from '@/atlas-pack';
import { SublimeFilmID, SublimeLayer } from '@/sublime-solitaire';
import { Sprite, SpriteProps } from '@/void';

export class SpriteFactory {
  #filmByID: FilmByID<SublimeFilmID>;

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
