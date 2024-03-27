import type {XY} from '@oidoid/void'

export type FollowCamConfig = {
  readonly fill?: 'X' | 'Y' | 'XY'
  readonly modulo?: Partial<XY> | undefined
  readonly orientation: FollowCamOrientation
  readonly pad?: Partial<XY> | undefined
}

/** The position relative the camera's bounding box. */
// prettier-ignore
export type FollowCamOrientation =
  'North' | 'Northeast' | 'East' | 'Southeast' | 'South' | 'Southwest' |
  'West' | 'Northwest' | 'Center'
