import type {Config} from '@oidoid/void'
import config from './config.json' with {type: 'json'}

config satisfies Config

export type Tag = keyof typeof config.tags
