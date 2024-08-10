import type { Atom } from './atom';
import type { Computed } from './computed';
import type { ExternalSource } from './external';
import { finalizationQueue } from './transaction';
import { BRAND } from './brand';

/**
 * Get the value of an atom or computed.
 */
export const get = <Value>(source: Source<Value>): Value => {
  if (source[BRAND] === 'E') {
    // External sources do not need staged values or rollbacks.
    return source._g();
  }

  if (finalizationQueue === null) {
    return source._c.get();
  }

  return source._s.get();
};

/** A reactive source, such as an atom or computed value. */
export type Source<Value> =
  | Atom<Value>
  | Computed<Value>
  | ExternalSource<Value>;
