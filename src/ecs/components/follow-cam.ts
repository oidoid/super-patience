import { XY } from '@/void'

export type FollowCamConfig = Readonly<{
  fill?: 'X' | 'Y' | 'XY'
  modulo?: Partial<XY> | undefined
  orientation: FollowCamOrientation
  pad?: Partial<XY> | undefined
}>

/** The position relative the camera's bounding box. */
export type FollowCamOrientation =
  // deno-fmt-ignore
  'North' | 'Northeast' | 'East' | 'Southeast' | 'South' | 'Southwest' |
  'West' | 'Northwest' | 'Center'
