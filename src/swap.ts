import { finalizationQueue } from './transaction';
import type { Atom } from './atom';

/**
 * Replace the current state of an atom. Can only be executed inside
 * a transaction. If the transaction fails, the value is reverted.
 */
export const swap = <Value>(atom: Sink<Value>, newState: Value): void => {
  const { _s: staged, _c: state } = atom;

  if (finalizationQueue === null) {
    throw new Error('Atoms can only be updated in an action().');
  }

  staged.set(newState);

  finalizationQueue.push((shouldCommit) => {
    if (shouldCommit) {
      state.set(newState);
    } else {
      staged.set(state.get());
    }
  });
};

/** A writable sink, such as an atom. */
export type Sink<Value> = Atom<Value>;
