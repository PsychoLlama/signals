import { createRef, trackDependency, callstack } from './dependencies';
import { createEffect } from './effect';

/**
 * Selectors compose signals or other selectors into a new value. Effects
 * using the selector will re-run when the value changes.
 */
export const createSelector = <Value>(selector: Selector<Value>) => {
  let value: Value;

  const [memo, onChange] = createRef(() =>
    createEffect(() => {
      const oldValue = value;
      value = selector();

      if (value !== oldValue) {
        onChange();
      }
    })
  );

  return () => {
    trackDependency(memo);

    // We're not in an effect. We have to compute once rather than subscribe.
    if (callstack.length === 0) {
      value = selector();
    }

    return value;
  };
};

interface Selector<Value> {
  (): Value;
}
