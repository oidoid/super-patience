import { SublimeSolitaire } from './SublimeSolitaire.ts';

// [strings][version]
console.log(`sublime-solitaire v0.0.0
   ┌>°┐
by │  │idoid
   └──┘`);

const sublime = await SublimeSolitaire.make(window);
SublimeSolitaire.start(sublime);
