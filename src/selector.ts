import { Signal } from 'signal-polyfill';
import { finalizationQueue } from './transaction';

export const selector = <T>(deriver: () => T): Selector<T> => {
  const committed = new Signal.Computed(deriver);
  const staged = new Signal.Computed(deriver);

  const deriveState = () => {
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

  return deriveState;
};

export type Selector<T> = () => T;
