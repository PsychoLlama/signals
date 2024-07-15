import type { Atom } from './atom';
import type { Computed } from './computed';
import { finalizationQueue } from './transaction';

/**
 * Get the value of an atom or computed.
 */
export const get = <Value>(store: Atom<Value> | Computed<Value>): Value => {
  if (finalizationQueue === null) {
    return store._c.get();
  }

  return store._s.get();
};
