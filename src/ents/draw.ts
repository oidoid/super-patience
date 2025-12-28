import type * as V from '@oidoid/void'

export type DrawEnt = V.SysEnt<DrawSys>

export class DrawSys implements V.Sys {
  readonly query = 'draw'

  update(_ent: DrawEnt, v: V.Void): void {
    if (!v.invalid) return
    v.renderer.clear(v.backgroundRGBA)
    v.renderer.predraw(v.cam)
    v.renderer.setDepth(true)
    v.renderer.draw(v.pool.default)
  }
}
