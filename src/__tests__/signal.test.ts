import { createSignal } from '../';

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
});
