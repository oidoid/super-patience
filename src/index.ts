import { SuperPatience } from '@/super-patience'
import config from '../deno.json' assert { type: 'json' }

// [strings][version]
console.log(`Super Patience v${config.version}
   ┌>°┐
by │  │idoid
   └──┘`)

const patience = await SuperPatience.make(window)
SuperPatience.start(patience)
