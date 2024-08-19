import { Signal } from 'signal-polyfill';
import { BRAND } from './brand';

/**
 * Creates a readable value that pulls from an external source. This is useful
 * for integrating with other data sources that change over time.
 */
export const external = <Value>(
  /** Read a snapshot of the data. This function should be pure. */
  getSnapshot: () => Value,

  /**
   * A subscriber that watches for changes. It returns an `unsubscribe`
   * function that cleans up any listeners. It takes an `onChange` callback
   * which should be called whenever there is an update.
   *
   * Subscriptions are only active when the source is being observed.
   */
  subscribe: (onChange: () => void) => Unsubscribe
): ExternalSource<Value> => {
  const source = new Signal.Volatile(getSnapshot, { subscribe });

  return Object.defineProperties({} as ExternalSource<Value>, {
    [BRAND]: { value: 'E' },
    _s: { value: source },
    _c: { value: source },
  });
};

export interface ExternalSource<Value> {
  /**
   * Identifies the source type.
   * @private
   */
  [BRAND]: 'E';

  /**
   * Staged value used in transactions.
   * @private
   */
  _s: Signal.Volatile<Value>;

  /**
   * Get a snapshot of the current value.
   * @private
   */
  _c: Signal.Volatile<Value>;
}

type Unsubscribe = () => void;
