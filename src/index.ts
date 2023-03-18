import { SuperPatience } from '@/super-patience'
import config from '../deno.json' assert { type: 'json' }

declare global {
  // deno-lint-ignore no-var
  var patience: SuperPatience
}

// [strings][version]
console.log(`Super Patience v${config.version}
   ┌>°┐
by │  │idoid
   └──┘`)

globalThis.patience = await SuperPatience.make(window)
SuperPatience.start(patience)
