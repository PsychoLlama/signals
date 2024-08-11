import { behavior, action, swap, suspendEffects } from '../';

describe('suspendEffects', () => {
  it('suspends effects until you invoke the callback', async () => {
    const spy = vi.fn();
    const effect = behavior<boolean>(spy);

    const run = action(() => {
      swap(effect, true);
    });

    const commit = suspendEffects(() => run());

    expect(spy).not.toHaveBeenCalled();
    await commit();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
