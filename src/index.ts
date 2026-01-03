import * as V from '@oidoid/void'
import {Solitaire} from 'klondike-solitaire'
import {description} from './assets/manifest.json' // non-standard import to treeshake.
import config from './assets/void.game.json' with {type: 'json'}
import {LoaderSys} from './ents/loader.ts'
import {type Save, saveKey} from './types/save.ts'

console.debug(
  `Super Patience v${V.bundle.version}+${V.bundle.published}.${V.bundle.hash} ───oidoid>°──`
)

const v = new V.Void({
  config: config as V.GameConfig,
  description,
  preloadAtlas: document.querySelector<HTMLImageElement>('#atlas'),
  loader: {loader: {level: undefined}},
  loaderSys: new LoaderSys()
})
v.setPoller(60_000 as V.Millis, () => V.millisUntilNext(new Date(), 'Min'))
setTimeout(
  () => {
    v.requestFrame('Force')
    setInterval(() => v.requestFrame('Force'), 60_000)
  },
  V.mod(V.millisUntilNext(new Date(), 'Min') + 59700, 60_000)
)
// h = 2 (border) + 71 (offset) + 8 * 7 (initial stack with a king on top) + 11 * 7 (Q-2) + (A) 32 - (dont care) 24 = 214
const save = V.loadJSON<Save>(saveKey) ?? {wins: 0}
v.solitaire = Solitaire(() => v.random.num, save.wins)
await v.register('add')
