import { XY } from '@/void'

export type FollowCamConfig = {
  readonly fill?: 'X' | 'Y' | 'XY'
  readonly modulo?: Partial<XY> | undefined
  readonly orientation: FollowCamOrientation
  readonly pad?: Partial<XY> | undefined
}

/** The position relative the camera's bounding box. */
export type FollowCamOrientation =
  // deno-fmt-ignore
  'North' | 'Northeast' | 'East' | 'Southeast' | 'South' | 'Southwest' |
  'West' | 'Northwest' | 'Center'
