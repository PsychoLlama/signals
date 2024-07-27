# Signal Transactions

A wrapper providing transactional atomicity over [The JS Signals Proposal](https://github.com/tc39/proposal-signals).

## Project Status

:scientist: Experimental

I'm using this in personal projects. There are rough edges and the API is constantly evolving. I might abandon it.

## Installing

```bash
npm install --save @blabbing/signals
```

To use the bleeding edge version from the `main` branch, use the `@rc` tag (release candidate):

```bash
npm install --save @blabbing/signals@rc
```

## Usage

Everything is built around atoms. Atoms are reactive values that can be read and updated.

```ts
import { atom, swap, get } from '@blabbing/signals';

const $count = atom(0);

console.log(get($count)); // 0

const increment = action((amount) => {
  swap($count, get($count) + amount);
});
```

The `Signal` API is exported for advanced cases, such as custom bindings or watchers. See the React binding for an example.

## Bindings

A few bindings are exposed for popular packages. They're optional and assume you've already installed the package.

### React

```ts
// React
import { atom } from '@blabbing/signals';
import { useValue } from '@blabbing/signals/react';

const $count = atom(0);

export function Counter() {
    const count = useValue($count)
    return <p>Count: {count}</p>
}
```

### Immer

```ts
import { atom, action } from '@blabbing/signals';
import { update } from '@blabbing/signals/immer';

const $state = atom({ count: 0 });

export const increment = action(() => {
  update($state, (draft) => {
    draft.count += 1;
  });
});
```
