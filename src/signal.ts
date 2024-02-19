import { trackDependency, createRef, Unsubscribe } from './dependencies';

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
