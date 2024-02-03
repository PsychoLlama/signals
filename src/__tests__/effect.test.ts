import { createEffect, createSignal } from '../';
import { callstack } from '../dependencies';

describe('createEffect', () => {
  it('runs the effect immediately', () => {
    const effect = vi.fn();
    createEffect(effect);

    expect(effect).toHaveBeenCalled();
  });

  it('reruns the effect when dependencies change', () => {
    const [value, setValue] = createSignal('initial');
    const effect = vi.fn(() => {
      value();
    });

    createEffect(effect);

    expect(effect).toHaveBeenCalledTimes(1);
    setValue('updated');
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('does not run the effect after it is disposed', () => {
    const [value, setValue] = createSignal('initial');
    const effect = vi.fn(() => {
      value();
    });

    const dispose = createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    dispose();
    setValue('updated');
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('allows changing dependencies over time', () => {
    const [first, setFirst] = createSignal(1);
    const [second, setSecond] = createSignal(2);

    const effect = vi.fn();
    effect.mockImplementationOnce(() => {
      first();
    });

    effect.mockImplementation(() => {
      second();
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    setFirst(3);
    expect(effect).toHaveBeenCalledTimes(2);

    // Effect is no longer subscribed to "first".
    setFirst(4);
    expect(effect).toHaveBeenCalledTimes(2);

    // Effect is only subscribed to "second".
    setSecond(5);
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it('runs the cleanup handler before starting a new effect', () => {
    const [value, setValue] = createSignal(0);

    const cleanup = vi.fn();
    createEffect(() => {
      value();

      return cleanup;
    });

    expect(cleanup).not.toHaveBeenCalled();

    setValue(1);
    expect(cleanup).toHaveBeenCalled();
  });

  it('runs the cleanup handler after disposing of the effect', () => {
    const cleanup = vi.fn();
    const dispose = createEffect(() => cleanup);

    expect(cleanup).not.toHaveBeenCalled();
    dispose();
    expect(cleanup).toHaveBeenCalled();
  });

  it('only subscribes to the same signal once', () => {
    const [value, setValue] = createSignal(0);

    const effect = vi.fn(() => {
      value();
      value();
      value();
    });

    createEffect(effect);

    expect(effect).toHaveBeenCalledTimes(1);

    setValue(1);
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('pushes and pops the effect stack according to nesting', () => {
    expect(callstack).toHaveLength(0);
    createEffect(() => {
      expect(callstack).toHaveLength(1);
      createEffect(() => {
        expect(callstack).toHaveLength(2);
        createEffect(() => {
          expect(callstack).toHaveLength(3);
        });
        expect(callstack).toHaveLength(2);
      });
      expect(callstack).toHaveLength(1);
    });
    expect(callstack).toHaveLength(0);
  });

  it('does not corrupt dependencies if the effect throws an error', () => {
    const [count, setCount] = createSignal(0);
    const [nested, setNested] = createSignal(0);
    const effect = vi.fn(() => {
      if (count() > 0) {
        nested();
        throw new Error('test');
      }
    });

    createEffect(effect);
    expect(() => setCount(1)).toThrow('test');

    expect(effect).toHaveBeenCalledTimes(2);

    // Any subscriptions leading up to the error were not committed. The old
    // subscriptions should still be in place.
    setNested(1);
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('pops the effect stack even if the effect throws an error', () => {
    const effect = () => {
      throw new Error('test');
    };

    expect(() => createEffect(effect)).toThrow('test');

    expect(callstack).toHaveLength(0);
  });

  it('only runs the effect if the signal value actually changed', () => {
    const [count, setCount] = createSignal(0);

    const effect = vi.fn(() => {
      count();
    });

    createEffect(effect);

    expect(effect).toHaveBeenCalledTimes(1);
    setCount(0);
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
