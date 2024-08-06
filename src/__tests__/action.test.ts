import { action, atom, swap, get } from '../';

describe('action', () => {
  it('returns whatever the handler returns', () => {
    const doSomething = action(() => 'return value');

    expect(doSomething()).toBe('return value');
  });

  it('passes along the same arguments', () => {
    const doSomething = action((a: number, b: string) => `${a} ${b}`);

    expect(doSomething(1, 'two')).toBe('1 two');
  });

  it('allows nested actions', () => {
    const $count = atom(0);
    const outer = action(() => {
      swap($count, get($count) + 1);
      inner();
      swap($count, get($count) + 100);
    });

    const inner = action(() => {
      swap($count, get($count) + 10);
    });

    expect(get($count)).toBe(0);
    outer();
    expect(get($count)).toBe(111);
  });

  it('does not roll back inner transactions', () => {
    const $msg = atom('initial');
    const outer = action(() => {
      // Call and catch the inner error ...
      expect(inner).toThrow();
      // ... and exit the transaction successfully.
    });

    const inner = action(() => {
      swap($msg, 'changed');
      throw new Error('Testing nested actions with errors');
    });

    expect(get($msg)).toBe('initial');
    expect(outer).not.toThrow();
    expect(get($msg)).toBe('changed');
  });

  // This is obvious from the implementation, but is worth verifying.
  it('rolls back nested actions if errors bubble to the top', () => {
    const $msg = atom('initial');
    const outer = action(() => {
      inner(); // Throws an error, fails the action.
    });

    const inner = action(() => {
      swap($msg, 'changed');
      throw new Error('Testing nested actions with errors');
    });

    expect(get($msg)).toBe('initial');
    expect(outer).toThrow(/Testing nested actions/);
    expect(get($msg)).toBe('initial');
  });
});
