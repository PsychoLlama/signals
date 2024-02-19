import { trackDependency, createRef, Unsubscribe } from './dependencies';

/**
 * A value that can be read and written. Effects that use the signal will
 * re-run when the value changes.
 *
 * Optionally you can provide an effect that runs when the signal starts being
 * observed, and stops when the last observer is removed. This is useful to
 * set up listeners to external sources, like DOM events or URL changes.
 */
export const createSignal = <Value>(
  initialValue: Value,
  effect?: () => Unsubscribe
): Signal<Value> => {
  let value = initialValue;
  const [signal, onChange] = createRef(effect);

  return [
    function getValue() {
      trackDependency(signal);
      return value;
    },

    function setValue(newValue) {
      if (value === newValue) return;

      value = newValue;
      onChange();
    },
  ];
};

export type Signal<Value> = [
  /** Get the current value of the signal. */
  getValue: () => Value,

  /** Set the value of the signal. */
  setValue: (newValue: Value) => void,
];
