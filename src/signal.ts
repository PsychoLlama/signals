import { effectStack } from './effect';

export const createSignal = <Value>(initialValue: Value): Signal<Value> => {
  let value = initialValue;

  const observers = new Set<Callback>();
  const subscribeToSignal: SubscribeToSignal = (subscriber) => {
    observers.add(subscriber);

    return () => {
      observers.delete(subscriber);
    };
  };

  return [
    function getValue() {
      const currentEffect = effectStack[effectStack.length - 1];
      currentEffect?.(subscribeToSignal);

      return value;
    },

    function setValue(newValue) {
      value = newValue;

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

export interface SubscribeToSignal {
  (callback: Callback): () => void;
}

export interface Callback {
  (): void;
}
