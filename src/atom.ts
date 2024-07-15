import { Signal } from 'signal-polyfill';

/**
 * Store a single value. Values can be read or replaced. Use `swap` to replace
 * the value inside an action.
 *
 * Reading state in a computed or effect will subscribe to changes.
 */
export const atom = <Value>(initialState: Value): Atom<Value> =>
  Object.defineProperties({} as Atom<Value>, {
    _s: { value: new Signal.State(initialState) },
    _c: { value: new Signal.State(initialState) },
  });

export interface Atom<Value> {
  /**
   * Staged value used during transactions.
   * @private
   */
  _s: Signal.State<Value>;

  /**
   * Committed value.
   * @private
   */
  _c: Signal.State<Value>;
}
