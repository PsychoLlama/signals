import { produce, type Producer } from 'immer';
import { get, swap, type Atom } from '@blabbing/signals';

/**
 * Immutably update the value of an atom using imperative syntax.
 *
 * NOTE: This requires `immer` to be installed.
 */
export const patch = <Value>(
  atom: Atom<Value>,
  recipe: Producer<Value>
): void => {
  swap(atom, produce(get(atom), recipe));
};
