import { Signal } from 'signal-polyfill';
import { atom, action, selector, get, swap } from '../';

describe('selector', () => {
  it('returns the computed state', () => {
    const count = atom(0);
    const add1 = selector(() => get(count) + 1);

    expect(get(add1)).toBe(1);
  });

  it('caches values between invocations', () => {
    const computed = selector(() => {
      return { object: 'equal' };
    });

    expect(get(computed)).toBe(get(computed));
  });

  it('detects changes to the source atoms', () => {
    const count = atom(0);
    const add1 = selector(() => get(count) + 1);

    const computed = new Signal.Computed(() => get(add1));
    computed.get(); // Compute and cache dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(computed);

    const update = action(() => {
      swap(count, get(count) + 1);
    });

    expect(spy).not.toHaveBeenCalled();
    update();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not detect changes from failed transactions', () => {
    const count = atom(0);
    const add1 = selector(() => get(count) + 1);

    const computed = new Signal.Computed(() => get(add1));
    computed.get(); // Compute and cache dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(computed);

    const update = action(() => {
      swap(count, get(count) + 1);
      throw new Error('Abort');
    });

    expect(spy).not.toHaveBeenCalled();
    expect(() => update()).toThrow('Abort');
    expect(spy).not.toHaveBeenCalled();
  });

  it('maintains consistent dependencies through transactions', () => {
    const count = atom(0);
    const add1 = selector(() => get(count) + 1);

    const computed = new Signal.Computed(() => get(add1));
    computed.get(); // Compute and cache dependencies.

    const changeDetector = vi.fn();
    const watcher = new Signal.subtle.Watcher(changeDetector);
    watcher.watch(computed);

    const update = action((fail: boolean) => {
      expect(get(add1)).toBe(1);
      swap(count, get(count) + 1);
      expect(get(add1)).toBe(2);

      if (fail) {
        throw new Error('Abort');
      }
    });

    expect(changeDetector).not.toHaveBeenCalled();
    expect(() => update(true)).toThrow('Abort');
    expect(changeDetector).not.toHaveBeenCalled();
    update(false);
    expect(changeDetector).toHaveBeenCalled();
  });

  it('caches values between invocations inside transactions', () => {
    const computed = selector(() => {
      return { object: 'equal' };
    });

    const update = action(() => {
      expect(get(computed)).toBe(get(computed));
      return get(computed);
    });

    expect(update).not.toThrow();

    // Testing internal implementation: A different selector is used if you're
    // inside a transaction in order to use the staged values without altering
    // dependencies of the outer selector.
    expect(update()).not.toBe(get(computed));
  });
});
