import { Signal } from 'signal-polyfill';
import { finalizationQueue } from './transaction';

export const atom = <Value>(initialState: Value): Atom<Value> => {
  const signal = new Signal.State(initialState);
  let uncommittedState = initialState;

  const getState = () => {
    if (finalizationQueue === null) {
      return signal.get();
    }

    return uncommittedState;
  };

  const setState = (newState: Value) => {
    if (finalizationQueue === null) {
      throw new Error('Atoms can only be updated in an action().');
    }

    uncommittedState = newState;
    finalizationQueue.push((commit) => {
      if (commit) {
        signal.set(newState);
      } else {
        uncommittedState = signal.get();
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
