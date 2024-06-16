import { Signal } from 'signal-polyfill';

import { atom } from '../atom';
import { action } from '../action';

describe('atom', () => {
  it('holds and returns the initial state', () => {
    const [getState] = atom('initial state');

    expect(getState()).toBe('initial state');
  });

  it('fails if you try to update outside an action', () => {
    const [_, setState] = atom(0);
    const fail = () => setState(1);

    expect(fail).toThrow(/only be updated in an action/);
  });

  it('can replace the current state', () => {
    const [getState, setState] = atom(0);

    const update = action(() => {
      setState(1);
    });

    expect(getState()).toBe(0);
    update();
    expect(getState()).toBe(1);
  });

  it('does not commit changes if the action fails', () => {
    const [getState, setState] = atom(0);

    const update = action(() => {
      setState(1);
      throw new Error('fail');
    });

    expect(getState()).toBe(0);
    expect(update).toThrow('fail');
    expect(getState()).toBe(0);
  });

  it('notifies watchers when changes occur', () => {
    const [getCount, setCount] = atom(0);
    const selector = new Signal.Computed(() => getCount());
    selector.get(); // Initialize selector dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(selector);

    const increment = action(() => setCount(getCount() + 1));

    expect(spy).not.toHaveBeenCalled();
    increment();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not notify watchers if the transaction was aborted', () => {
    const [getCount, setCount] = atom(0);
    const selector = new Signal.Computed(() => getCount());
    selector.get(); // Initialize selector dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(selector);

    const increment = action(() => {
      setCount(getCount() + 1);
      throw new Error('fail');
    });

    expect(spy).not.toHaveBeenCalled();
    expect(increment).toThrow('fail');
    expect(spy).not.toHaveBeenCalled();
  });

  it('reflects the uncommitted state while in a transaction', () => {
    const [getState, setState] = atom(0);

    const update = action(() => {
      setState(1);
      expect(getState()).toBe(1);
      setState(2);
      expect(getState()).toBe(2);
    });

    expect(getState()).toBe(0);
    update();
    expect(getState()).toBe(2);
  });

  it('resets uncommitted states between transactions', () => {
    const [getState, setState] = atom('initial');

    const update = action(() => {
      expect(getState()).toBe('initial');
      setState('modified');
      throw new Error('aborting action');
    });

    expect(update).toThrow(/aborting action/);
    expect(update).toThrow(/aborting action/);
  });
});
