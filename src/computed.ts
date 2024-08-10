import { Signal } from 'signal-polyfill';
import { BRAND } from './brand';

/**
 * Compute and cache a value. Derivers are cached by the atoms they use. If
 * the atoms change, the deriver will recompute the value the next time it is
 * called.
 */
export const computed = <Value>(deriver: () => Value): Computed<Value> =>
  Object.defineProperties({} as Computed<Value>, {
    [BRAND]: { value: 'C' },
    _s: { value: new Signal.Computed(deriver) },
    _c: { value: new Signal.Computed(deriver) },
  });

export interface Computed<Value> {
  /**
   * Identifies the source type.
   * @private
   */
  [BRAND]: 'C';

  /**
   * Staged value used during transactions.
   */
  _s: Signal.Computed<Value>;

  /**
   * Committed value.
   */
  _c: Signal.Computed<Value>;
}
