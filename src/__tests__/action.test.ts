import { action } from '../action';

describe('action', () => {
  it('returns whatever the handler returns', () => {
    const doSomething = action(() => 'return value');

    expect(doSomething()).toBe('return value');
  });

  it('passes along the same arguments', () => {
    const doSomething = action((a: number, b: string) => `${a} ${b}`);

    expect(doSomething(1, 'two')).toBe('1 two');
  });

  it('fails if you dispatch an action within another action', () => {
    const outer = action(() => inner());
    const inner = action(() => {});

    expect(outer).toThrow(/inside other actions/);
  });
});
