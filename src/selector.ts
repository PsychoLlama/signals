import { Signal } from 'signal-polyfill';
import { finalizationQueue } from './transaction';

/**
 * Compute and cache a value. Selectors are cached by the atoms they use. If
 * the atoms change, the selector will recompute the value the next time it is
 * called.
 */
export const selector = <Value>(deriver: () => Value): Selector<Value> => {
  const committed = new Signal.Computed(deriver);
  const staged = new Signal.Computed(deriver);

  return () => {
    if (finalizationQueue === null) {
      return committed.get();
    } else {
      // The atoms inside a transaction are uncommitted, and using the real
      // selector would bleed change events and alter dependencies.
      //
      // Using a different selector avoids these issues at the cost of
      // duplicating the cache.
      return staged.get();
    }
  };
};

export type Selector<Value> = () => Value;
