import { AtlasMeta } from '@/atlas-pack'
import { atlasJSON, SPFilmID } from '@/super-patience'
import {
  Assets,
  ImageLoader,
  shaderLayoutConfig,
  ShaderLayoutParser,
} from '@/void'

export namespace SPAssets {
  export async function load(): Promise<Assets<SPFilmID>> {
    const atlas = await ImageLoader.load('atlas.png')
    const atlasMeta = AtlasMeta.fromJSON<SPFilmID>(atlasJSON)
    const shaderLayout = ShaderLayoutParser.parse(shaderLayoutConfig)
    return { atlas, atlasMeta, shaderLayout }
  }
}
