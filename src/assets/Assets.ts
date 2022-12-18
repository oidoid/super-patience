import { AtlasMeta } from '@/atlas-pack';
import {
  ImageLoader,
  ShaderLayout,
  shaderLayoutConfig,
  ShaderLayoutParser,
} from '@/void';
import atlasJSON from '../../assets/atlas.json' assert { type: 'json' };
import { SublimeFilmID } from './SublimeFilmID.ts';

export interface Assets {
  readonly atlas: Readonly<HTMLImageElement>;
  readonly atlasMeta: Readonly<AtlasMeta<SublimeFilmID>>;
  readonly shaderLayout: ShaderLayout;
}

export namespace Assets {
  export async function load(): Promise<Assets> {
    const atlas = await ImageLoader.load('atlas.png');
    const atlasMeta = atlasJSON as unknown as AtlasMeta<SublimeFilmID>;
    const shaderLayout = ShaderLayoutParser.parse(shaderLayoutConfig);
    return { atlas, atlasMeta, shaderLayout };
  }
}
