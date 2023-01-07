import { SuperPatience } from '@/super-patience';
import pkg from '../package.json' assert { type: 'json' };

// [strings][version]
console.log(`Super Patience v${pkg.version}
   ┌>°┐
by │  │idoid
   └──┘`);

const patience = await SuperPatience.make(window);
SuperPatience.start(patience);
