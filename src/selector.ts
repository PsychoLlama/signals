import { Signal } from 'signal-polyfill';

/**
 * Compute and cache a value. Selectors are cached by the atoms they use. If
 * the atoms change, the selector will recompute the value the next time it is
 * called.
 */
export const selector = <Value>(deriver: () => Value): Selector<Value> =>
  Object.defineProperties({} as Selector<Value>, {
    _s: { value: new Signal.Computed(deriver) },
    _c: { value: new Signal.Computed(deriver) },
  });

export interface Selector<Value> {
  /**
   * Staged value used during transactions.
   */
  _s: Signal.Computed<Value>;

  /**
   * Committed value.
   */
  _c: Signal.Computed<Value>;
}
