import { Signal } from 'signal-polyfill';
import { finalizationQueue } from './transaction';

export const atom = <Value>(initialState: Value): Atom<Value> => {
  const signal = new Signal.State(initialState);

  const getState = () => signal.get();

  const setState = (newState: Value) => {
    if (finalizationQueue === null) {
      throw new Error('Atoms can only be updated in an action().');
    }

    finalizationQueue.push(() => signal.set(newState));
  };

  return [getState, setState];
};

export type Atom<Value> = [
  getState: () => Value,
  setState: (newState: Value) => void,
];
