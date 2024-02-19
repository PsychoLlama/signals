# Signals

A tiny, unserious alternative to [preact signals](https://github.com/preactjs/signals) and [solid signals](https://www.solidjs.com/).

```ts
import { createSignal, createEffect } from 'this-lib';

const [enabled, setEnabled] = createSignal(false);
const dispose = createEffect(() => {
  if (enabled()) {
    console.log('hello, world');
  }
});

// Prints "hello, world"
setEnabled(true);
```

It's got the standard bells and whistles such as untracked callbacks, selectors, and batching.

## Purpose

I was bored, I wanted to see how it worked. I'm not using it.
