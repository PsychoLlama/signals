import { action } from '../';

describe('action', () => {
  it('returns whatever the handler returns', async () => {
    const doSomething = action(() => 'return value');

    await expect(doSomething()).resolves.toBe('return value');
  });

  it('passes along the same arguments', async () => {
    const doSomething = action((a: number, b: string) => `${a} ${b}`);

    await expect(doSomething(1, 'two')).resolves.toBe('1 two');
  });

  it('throws if you start an action inside another action', async () => {
    const outer = action(() => {
      return inner();
    });

    const inner = action(() => {
      // No effect.
    });

    await expect(outer).rejects.toThrow(/cannot call other actions/);
  });
});
