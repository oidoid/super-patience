import { Atlas } from '@/atlas-pack'
import { atlasJSON, SPFilmID } from '@/super-patience'
import {
  Assets,
  loadImage,
  parseShaderLayout,
  shaderLayoutConfig,
} from '@/void'

export async function loadAssets(): Promise<Assets<SPFilmID>> {
  const spritesheet = await loadImage('atlas.png')
  const atlas = Atlas.fromJSON<SPFilmID>(atlasJSON)
  const shaderLayout = parseShaderLayout(shaderLayoutConfig)
  return { atlas, spritesheet, shaderLayout }
}
