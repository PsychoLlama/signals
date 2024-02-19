import { createEffect, createSignal } from '../';

describe('createSignal', () => {
  it('uses the parameter as the initial value', () => {
    const [value] = createSignal('initial value');

    expect(value()).toBe('initial value');
  });

  it('can update the value', () => {
    const [value, setValue] = createSignal('initial');

    setValue('updated');

    expect(value()).toBe('updated');
  });

  it('calls a setup/teardown handler when observed', () => {
    const [value, setValue] = createSignal('initial', () => {
      setValue('observed');

      return () => {
        setValue('not observed');
      };
    });

    expect(value()).toBe('initial');
    const dispose = createEffect(() => {
      value();
    });

    expect(value()).toBe('observed');

    dispose();
    expect(value()).toBe('not observed');
  });
});
