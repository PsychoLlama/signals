import { Signal } from 'signal-polyfill';
import { atom, action, computed, get, swap } from '../';

describe('computed', () => {
  it('returns the computed state', () => {
    const $count = atom(0);
    const $add1 = computed(() => get($count) + 1);

    expect(get($add1)).toBe(1);
  });

  it('caches values between invocations', () => {
    const $value = computed(() => {
      return { object: 'equal' };
    });

    expect(get($value)).toBe(get($value));
  });

  it('detects changes to the source atoms', async () => {
    const $count = atom(0);
    const $add1 = computed(() => get($count) + 1);

    const query = new Signal.Computed(() => get($add1));
    query.get(); // Compute and cache dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(query);

    const update = action(() => {
      swap($count, get($count) + 1);
    });

    expect(spy).not.toHaveBeenCalled();
    await update();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not detect changes from failed transactions', async () => {
    const $count = atom(0);
    const $add1 = computed(() => get($count) + 1);

    const query = new Signal.Computed(() => get($add1));
    query.get(); // Compute and cache dependencies.

    const spy = vi.fn();
    const watcher = new Signal.subtle.Watcher(spy);
    watcher.watch(query);

    const update = action(() => {
      swap($count, get($count) + 1);
      throw new Error('Abort');
    });

    expect(spy).not.toHaveBeenCalled();
    await expect(update()).rejects.toThrow('Abort');
    expect(spy).not.toHaveBeenCalled();
  });

  it('maintains consistent dependencies through transactions', async () => {
    const $count = atom(0);
    const $add1 = computed(() => get($count) + 1);

    const query = new Signal.Computed(() => get($add1));
    query.get(); // Compute and cache dependencies.

    const changeDetector = vi.fn();
    const watcher = new Signal.subtle.Watcher(changeDetector);
    watcher.watch(query);

    const update = action((fail: boolean) => {
      expect(get($add1)).toBe(1);
      swap($count, get($count) + 1);
      expect(get($add1)).toBe(2);

      if (fail) {
        throw new Error('Abort');
      }
    });

    expect(changeDetector).not.toHaveBeenCalled();
    await expect(update(true)).rejects.toThrow('Abort');
    expect(changeDetector).not.toHaveBeenCalled();
    await expect(update(false)).resolves.not.toThrow();
    expect(changeDetector).toHaveBeenCalled();
  });

  it('caches values between invocations inside transactions', async () => {
    const $value = computed(() => {
      return { object: 'equal' };
    });

    const update = action(() => {
      expect(get($value)).toBe(get($value));
      return get($value);
    });

    await expect(update()).resolves.not.toThrow();

    // Testing internal implementation: A different computed is used if you're
    // inside a transaction in order to use the staged values without altering
    // dependencies of the outer computed.
    await expect(update()).resolves.not.toBe(get($value));
  });
});
