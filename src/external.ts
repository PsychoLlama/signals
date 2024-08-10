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
  let unsubscribe: () => void;

  const onChange = () => {
    stateVersion.set(stateVersion.get() + 1);
  };

  // We don't store the value in a signal. `getSnapshot()` is the source of
  // truth. The state version is used to notify watchers when a new value is
  // available from `getSnapshot()`.
  const stateVersion = new Signal.State(0, {
    [Signal.subtle.watched]() {
      unsubscribe = subscribe(onChange);
    },

    [Signal.subtle.unwatched]() {
      unsubscribe();
    },
  });

  return Object.defineProperties({} as ExternalSource<Value>, {
    [BRAND]: { value: 'E' },
    _c: { value: stateVersion },
    _g: {
      value() {
        stateVersion.get();
        return getSnapshot();
      },
    },
  });
};

export interface ExternalSource<Value> {
  /**
   * Identifies the source type.
   * @private
   */
  [BRAND]: 'E';

  /**
   * State version.
   * @private
   */
  _c: Signal.State<number>;

  /**
   * Get a snapshot of the current value.
   * @private
   */
  _g: () => Value;
}

type Unsubscribe = () => void;
