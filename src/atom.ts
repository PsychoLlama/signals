import { Signal } from 'signal-polyfill';
import { finalizationQueue } from './transaction';

export const atom = <Value>(initialState: Value): Atom<Value> => {
  const state = new Signal.State(initialState);
  const staged = new Signal.State(initialState);

  const getState = () => {
    if (finalizationQueue === null) {
      return state.get();
    }

    return staged.get();
  };

  const setState = (newState: Value) => {
    if (finalizationQueue === null) {
      throw new Error('Atoms can only be updated in an action().');
    }

    staged.set(newState);

    finalizationQueue.push((commit) => {
      if (commit) {
        state.set(newState);
      } else {
        staged.set(state.get());
      }
    });
  };

  return [getState, setState];
};

export type Atom<Value> = [
  /** Get the current state. */
  getState: () => Value,

  /** Replace the current state. */
  setState: (newState: Value) => void,
];
