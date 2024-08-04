import { produce, type Producer } from 'immer';
import { get, swap, type Sink } from '@blabbing/signals';

/**
 * Immutably update the value of an atom using imperative syntax.
 *
 * NOTE: This requires `immer` to be installed.
 */
export const patch = <Value>(
  store: Sink<Value>,
  recipe: Producer<Value>
): void => {
  swap(store, produce(get(store), recipe));
};
