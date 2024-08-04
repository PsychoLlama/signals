import type { Atom } from './atom';
import type { Computed } from './computed';
import { finalizationQueue } from './transaction';

/**
 * Get the value of an atom or computed.
 */
export const get = <Value>(source: Source<Value>): Value => {
  if (finalizationQueue === null) {
    return source._c.get();
  }

  return source._s.get();
};

/** A reactive source, such as an atom or computed value. */
export type Source<Value> = Atom<Value> | Computed<Value>;
