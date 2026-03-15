import { produce, type Producer } from 'immer';
import { get, swap, type Atom } from '@babbling/signals';

/**
 * Immutably update the value of an atom using imperative syntax.
 *
 * NOTE: This requires `immer` to be installed.
 */
export const patch = <Value>(
  store: Atom<Value>, // TODO: Support behaviors.
  recipe: Producer<Value>
): void => {
  swap(store, produce(get(store), recipe));
};
