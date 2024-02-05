import { createSignal, createSelector, createEffect, batch } from '../';

describe('createSelector', () => {
  it('returns the value of the selector', () => {
    const [count] = createSignal(10);
    const [multiplier] = createSignal(2);
    const value = createSelector(() => count() * multiplier());

    expect(value()).toBe(20);
  });

  it('does not compute the value unless needed', () => {
    const [count, setCount] = createSignal(1);

    const compute = vi.fn(() => count());
    const value = createSelector(compute);

    expect(compute).not.toHaveBeenCalled();

    value();
    expect(compute).toHaveBeenCalledTimes(1);

    setCount(2);
    expect(compute).toHaveBeenCalledTimes(1);

    value();
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('notifies effects when the value changes', () => {
    const [count, setCount] = createSignal(1);
    const [multiplier, setMultiplier] = createSignal(2);

    const value = createSelector(() => count() * multiplier());
    const effect = vi.fn(() => {
      value();
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    setCount(2);
    expect(effect).toHaveBeenCalledTimes(2);

    setMultiplier(4);
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it('does not run the selector unnecessarily', () => {
    const [count, setCount] = createSignal(1);

    const selector = vi.fn(() => count());
    const value = createSelector(selector);

    expect(selector).not.toHaveBeenCalled();
    createEffect(() => {
      value();
    });

    expect(selector).toHaveBeenCalledTimes(1);

    setCount(2);
    expect(selector).toHaveBeenCalledTimes(2);
  });

  it('does not trigger effects if the selector returns the same value', () => {
    const [count, setCount] = createSignal(0);
    const [multiplier, setMultiplier] = createSignal(2);
    const value = createSelector(() => count() * multiplier());

    const effect = vi.fn(() => {
      value();
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    batch(() => {
      setCount(10);
      setMultiplier(0);
    });
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
