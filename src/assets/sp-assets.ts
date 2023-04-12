import { AtlasMeta } from '@/atlas-pack'
import { atlasJSON, SPFilmID } from '@/super-patience'
import {
  Assets,
  loadImage,
  parseShaderLayout,
  shaderLayoutConfig,
} from '@/void'

export async function loadAssets(): Promise<Assets<SPFilmID>> {
  const atlas = await loadImage('atlas.png')
  const atlasMeta = AtlasMeta.fromJSON<SPFilmID>(atlasJSON)
  const shaderLayout = parseShaderLayout(
    shaderLayoutConfig,
  )
  return { atlas, atlasMeta, shaderLayout }
}
