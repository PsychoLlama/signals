import { Signal } from 'signal-polyfill';

import { atom, action, get, swap } from '../';

describe('atom', () => {
  it('holds and returns the initial state', () => {
    const $msg = atom('initial state');

    expect(get($msg)).toBe('initial state');
  });

  it('fails if you try to update outside an action', () => {
    const $count = atom(0);
    const fail = () => swap($count, 1);

    expect(fail).toThrow(/only be updated in an action/);
  });

  it('can replace the current state', () => {
    const $count = atom(0);

    const update = action(() => {
      swap($count, 1);
    });

    expect(get($count)).toBe(0);
    update();
    expect(get($count)).toBe(1);
  });

  it('does not commit changes if the action fails', () => {
    const $count = atom(0);

    const update = action(() => {
      swap($count, 1);
      throw new Error('fail');
    });

    expect(get($count)).toBe(0);
    expect(update).toThrow('fail');
    expect(get($count)).toBe(0);
  });

  it('notifies watchers when changes occur', () => {
    const $count = atom(0);
    const selector = new Signal.Computed(() => get($count));
    selector.get(); // Initialize selector dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(selector);

    const increment = action(() => swap($count, get($count) + 1));

    expect(spy).not.toHaveBeenCalled();
    increment();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not notify watchers if the transaction was aborted', () => {
    const $count = atom(0);
    const selector = new Signal.Computed(() => get($count));
    selector.get(); // Initialize selector dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(selector);

    const increment = action(() => {
      swap($count, get($count) + 1);
      throw new Error('fail');
    });

    expect(spy).not.toHaveBeenCalled();
    expect(increment).toThrow('fail');
    expect(spy).not.toHaveBeenCalled();
  });

  // This appears to be the default behavior, but it's crucial enough to
  // verify through tests.
  it('does not notify watchers if the new value is identical', () => {
    const $count = atom(0);
    const selector = new Signal.Computed(() => get($count));
    selector.get(); // Initialize selector dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(selector);

    const setToSameValue = action(() => {
      swap($count, get($count));
    });

    expect(spy).not.toHaveBeenCalled();
    setToSameValue();
    expect(spy).not.toHaveBeenCalled();
  });

  it('reflects the uncommitted state while in a transaction', () => {
    const $count = atom(0);

    const update = action(() => {
      swap($count, 1);
      expect(get($count)).toBe(1);
      swap($count, 2);
      expect(get($count)).toBe(2);
    });

    expect(get($count)).toBe(0);
    update();
    expect(get($count)).toBe(2);
  });

  it('resets uncommitted states between transactions', () => {
    const $msg = atom('initial');

    const update = action(() => {
      expect(get($msg)).toBe('initial');
      swap($msg, 'modified');
      throw new Error('aborting action');
    });

    expect(update).toThrow(/aborting action/);
    expect(update).toThrow(/aborting action/);
  });
});
