import { Signal } from 'signal-polyfill';
import { selector } from '../selector';
import { atom } from '../atom';
import { action } from '../action';

describe('selector', () => {
  it('returns the computed state', () => {
    const [getCount] = atom(0);
    const add1 = selector(() => getCount() + 1);

    expect(add1()).toBe(1);
  });

  it('caches values between invocations', () => {
    const compute = selector(() => {
      return { object: 'equal' };
    });

    expect(compute()).toBe(compute());
  });

  it('detects changes to the source atoms', () => {
    const [getCount, setCount] = atom(0);
    const add1 = selector(() => getCount() + 1);

    const computed = new Signal.Computed(add1);
    computed.get(); // Compute and cache dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(computed);

    const update = action(() => {
      setCount(getCount() + 1);
    });

    expect(spy).not.toHaveBeenCalled();
    update();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not detect changes from failed transactions', () => {
    const [getCount, setCount] = atom(0);
    const add1 = selector(() => getCount() + 1);

    const computed = new Signal.Computed(add1);
    computed.get(); // Compute and cache dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(computed);

    const update = action(() => {
      setCount(getCount() + 1);
      throw new Error('Abort');
    });

    expect(spy).not.toHaveBeenCalled();
    expect(() => update()).toThrow('Abort');
    expect(spy).not.toHaveBeenCalled();
  });

  it('maintains consistent dependencies through transactions', () => {
    const [getCount, setCount] = atom(0);
    const add1 = selector(() => getCount() + 1);

    const computed = new Signal.Computed(add1);
    computed.get(); // Compute and cache dependencies.

    const changeDetector = vi.fn();
    const watcher = new Signal.subtle.Watcher(changeDetector);
    watcher.watch(computed);

    const update = action((fail: boolean) => {
      expect(add1()).toBe(1);
      setCount(getCount() + 1);
      expect(add1()).toBe(2);

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
    const compute = selector(() => {
      return { object: 'equal' };
    });

    const update = action(() => {
      expect(compute()).toBe(compute());
      return compute();
    });

    expect(update).not.toThrow();

    // Testing internal implementation: A different selector is used if you're
    // inside a transaction in order to use the staged values without altering
    // dependencies of the outer selector.
    expect(update()).not.toBe(compute());
  });
});
