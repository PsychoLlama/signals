import { createEffect, createSignal, untracked } from '../';

describe('untracked', () => {
  it('returns the callback value', () => {
    const value = untracked(() => 42);

    expect(value).toBe(42);
  });

  it('prevents effects from detecting dependencies', () => {
    const [visible, setVisible] = createSignal('visible');
    const [hidden, setHidden] = createSignal('hidden');

    const effect = vi.fn(() => {
      visible();
      untracked(() => hidden());
    });

    createEffect(effect);
    expect(effect).toHaveBeenCalledTimes(1);

    setVisible('updated');
    expect(effect).toHaveBeenCalledTimes(2);

    setHidden('updated');
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
