import { createSignal, createMemo } from '../';

describe('createMemo', () => {
  it('returns the value of the selector', () => {
    const [count] = createSignal(10);
    const [multiplier] = createSignal(2);
    const value = createMemo(() => count() * multiplier());

    expect(value()).toBe(20);
  });

  it('only recomputes if the values changed', () => {
    const [count, setCount] = createSignal(10);

    const compute = vi.fn(() => count());
    const value = createMemo(compute);

    value();
    value();
    value();

    expect(compute).toHaveBeenCalledTimes(1);

    setCount(20);
    expect(value()).toBe(20);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('does not compute the value unless needed', () => {
    const [count, setCount] = createSignal(1);

    const compute = vi.fn(() => count());
    const value = createMemo(compute);

    expect(compute).not.toHaveBeenCalled();

    value();
    expect(compute).toHaveBeenCalledTimes(1);

    setCount(2);
    expect(compute).toHaveBeenCalledTimes(1);

    value();
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('detects dependency changes', () => {
    const [flag, setFlag] = createSignal(false);
    const [msg, setMsg] = createSignal('original');

    const value = createMemo(() => (flag() ? msg() : ''));

    expect(value()).toBe('');

    setFlag(true);
    expect(value()).toBe('original');

    setMsg('changed');
    expect(value()).toBe('changed');
  });
});
