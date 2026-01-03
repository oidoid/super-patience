import type * as V from '@oidoid/void'

export class CamSys implements V.Sys {
  readonly query = 'cam'

  update(_ent: V.CamEnt, v: V.Void): void {
    v.cam.update(v.canvas)
    const camOffsetX = Math.trunc((v.cam.w - v.cam.minWH.w) / 2)
    v.cam.x = -camOffsetX + (camOffsetX % 8)
  }
}
