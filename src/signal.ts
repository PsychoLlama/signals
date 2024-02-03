import { callstack } from './dependencies';

export const createSignal = <Value>(initialValue: Value): Signal<Value> => {
  let value = initialValue;
  let version = 0;

  const observers = new Set<Callback>();
  const signal: SignalRef = {
    v: () => version,
    s: (callback) => {
      observers.add(callback);

      return () => {
        observers.delete(callback);
      };
    },
  };

  return [
    function getValue() {
      const currentEffect = callstack[callstack.length - 1];
      currentEffect?.(signal);

      return value;
    },

    function setValue(newValue) {
      if (value === newValue) return;

      value = newValue;
      version++;

      observers.forEach((subscriber) => {
        subscriber();
      });
    },
  ];
};

type Signal<Value> = [
  /** Get the current value of the signal. */
  getValue: () => Value,

  /** Set the value of the signal. */
  setValue: (newValue: Value) => void,
];

/**
 * A handle for inspecting and operating on signals. Fields are short because
 * minifiers cannot safely rename them.
 */
export interface SignalRef {
  /** Subscribe to changes. Returns an unsubscribe callback. */
  s: (callback: Callback) => () => void;

  /** Get the incrementing version number. Used for caching. */
  v: () => number;
}

export interface Callback {
  (): void;
}
