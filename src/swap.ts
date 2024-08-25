import { finalizationQueue, effectQueue } from './transaction';
import type { Atom } from './atom';
import type { Behavior } from './behavior';
import { BRAND } from './brand';

/**
 * Replace the current state of an atom. Can only be executed inside
 * a transaction. If the transaction fails, the value is reverted.
 */
export const swap = <Value>(sink: Sink<Value>, newState: Value): void => {
  if (finalizationQueue === null || effectQueue === null) {
    throw new Error('Changes can only be applied in an action().');
  }

  if (sink[BRAND] === 'A') {
    const { _s: staged, _c: state } = sink;
    staged.set(newState);

    finalizationQueue.set(sink as Atom<unknown>, (shouldCommit) => {
      if (shouldCommit) {
        state.set(newState);
      } else {
        staged.set(state.get());
      }
    });
  } else {
    effectQueue.set(sink as Behavior<unknown>, newState);
  }
};

/** A writable sink, such as an atom. */
export type Sink<Value> = Atom<Value> | Behavior<Value>;
