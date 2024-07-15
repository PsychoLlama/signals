import { atom, action, get } from '@pl-beta/signals';
import { patch, nothing } from '../';

describe('patch', () => {
  it('updates the value immutably', () => {
    const initialValue = { msg: 'initial' };
    const $value = atom(initialValue);

    const update = action((msg: string) => {
      patch($value, (draft) => {
        draft.msg = msg;
      });
    });

    expect(get($value)).toHaveProperty('msg', 'initial');
    update('updated');
    expect(get($value)).toHaveProperty('msg', 'updated');

    // Make sure it wasn't mutated.
    expect(initialValue.msg).toBe('initial');
  });

  it('can replace the value with nothing', () => {
    const $value = atom<undefined | string>('content');

    const unset = action(() => {
      patch($value, () => nothing);
    });

    unset();
    expect(get($value)).toBeUndefined();
  });
});
