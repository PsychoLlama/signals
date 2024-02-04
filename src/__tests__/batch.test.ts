import { createEffect, createSignal, batch } from '../';

describe('batch', () => {
  it('returns the value of the callback', () => {
    const value = batch(() => 10);

    expect(value).toBe(10);
  });

  it('suspends effects until the batch completes', () => {
    const [count, setCount] = createSignal(10);
    const [multiplier, setMultiplier] = createSignal(2);

    const effect = vi.fn(() => {
      count() * multiplier();
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    batch(() => {
      setCount(15);
      setMultiplier(3);
    });

    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('delays effects until the outermost batch is completed', () => {
    const [count, setCount] = createSignal(10);
    const [multiplier, setMultiplier] = createSignal(2);

    const effect = vi.fn(() => {
      count() * multiplier();
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    batch(() => {
      batch(() => setMultiplier(3));
      setCount(20);
    });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('recovers from errors', () => {
    const [count, setCount] = createSignal(10);
    const [multiplier, setMultiplier] = createSignal(2);

    const effect = vi.fn(() => {
      count() * multiplier();
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    const failure = () => {
      throw new Error('test');
    };

    // A naive implementation may leave the system in a broken state.
    expect(() => batch(failure)).toThrow('test');

    batch(() => {
      setCount(5);
      setMultiplier(5);
    });

    expect(effect).toHaveBeenCalledTimes(2);
  });
});
