<div align="center">
  <h2>Signal Transactions</h2>
  <p>State Machine 🤝 Spreadsheet Engine</p>
</div>

<p align="center">
  A wrapper providing transactional atomicity and an effect model over <a href="https://github.com/tc39/proposal-signals">The JS Signals Proposal</a>.
</p>

## Project Status

:no_entry: ABANDONED

It was a fun experiment. I'm continuing exploration in [retreon/cells](https://github.com/retreon/cells) (my own signals implementation). I've given up jamming signals into React and moved to platforms where it's first class.

## Philosophy

- State changes should only happen in response to IO events or errors.
- Changes should be batched and atomic.
- **Gather**, **Plan**, **Execute**: Effects run by gathering inputs, planning a change, and executing the plan.

## Installing

```bash
npm install --save @babbling/signals
```

To use the bleeding edge version from the `main` branch, use the `@rc` tag (release candidate):

```bash
npm install --save @babbling/signals@rc
```

## Usage

Everything is built around atoms. Atoms are reactive values that can be read and updated.

```ts
import { atom, swap, get } from '@babbling/signals';

const $count = atom(0);

console.log(get($count)); // 0

const increment = action((amount) => {
  swap($count, get($count) + amount);
});
```

Updates are executed in "actions", a batch of changes that apply all at once or not at all.

The `Signal` API is exported for advanced cases, such as custom bindings or watchers. See the React binding for an example.

### External Sources

For data sources that change over time, you can bind with the `external(...)` API:

```ts
const $visibility = external(
  () => document.visibilityState,
  (onChange) => {
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }
);
```

### Behaviors

Behaviors are the effect system. They are writable values inside actions and run when the action commits.

```ts
const useDarkTheme = action(() => {
  swap(theme, 'dark');
});

const theme = behavior((value: string) => {
  localStorage.setItem('theme', value);
});
```

## Bindings

A few bindings are exposed for popular packages. They're optional and assume you've already installed the package.

### React

```ts
// React
import { atom } from '@babbling/signals';
import { useValue } from '@babbling/signals/react';

const $count = atom(0);

export function Counter() {
    const count = useValue($count)
    return <p>Count: {count}</p>
}
```

### Immer

```ts
import { atom, action } from '@babbling/signals';
import { update } from '@babbling/signals/immer';

const $state = atom({ count: 0 });

export const increment = action(() => {
  update($state, (draft) => {
    draft.count += 1;
  });
});
```
