import type { Atom } from './atom';
import type { Selector } from './selector';
import { finalizationQueue } from './transaction';

/**
 * Get the value of an atom or selector.
 */
export const get = <Value>(store: Atom<Value> | Selector<Value>): Value => {
  if (finalizationQueue === null) {
    return store._c.get();
  }

  return store._s.get();
};
