import { behavior, action, swap } from '../';

describe('behavior', () => {
  it('throws if you trigger it outside an action', () => {
    const run = behavior<boolean>(() => {
      // No effect.
    });

    const fail = () => swap(run, true);

    expect(fail).toThrow(/applied in an action/);
  });

  it('runs effects after committing the action', () => {
    const spy = vi.fn();
    const effect = behavior<boolean>(spy);

    const run = action(() => {
      swap(effect, true);
    });

    expect(spy).not.toHaveBeenCalled();
    expect(run).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not run effects if the transaction fails', () => {
    const spy = vi.fn();
    const effect = behavior<boolean>(spy);

    const run = action(() => {
      swap(effect, true);
      throw new Error('Abort');
    });

    expect(spy).not.toHaveBeenCalled();
    expect(run).toThrow('Abort');
    expect(spy).not.toHaveBeenCalled();
  });

  it('only runs the effect once with the most recent value', () => {
    const spy = vi.fn();
    const effect = behavior<number>(spy);

    const run = action(() => {
      swap(effect, 1);
      swap(effect, 2);
    });

    expect(spy).not.toHaveBeenCalled();
    expect(run).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('does not re-run effects if another action cycle runs inside the effect', () => {
    const spy = vi.fn();
    const first = behavior<boolean>(() => {
      spy('first');

      // IMO this is a code smell, but it's valid.
      action(() => {
        swap(second, true);
      })();
    });

    const second = behavior<boolean>(() => {
      spy('second');
    });

    const run = action(() => {
      swap(first, true);
    });

    expect(spy).not.toHaveBeenCalled();
    expect(run).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('first');
    expect(spy).toHaveBeenCalledWith('second');
  });
});
