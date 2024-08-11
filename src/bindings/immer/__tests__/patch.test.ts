import { atom, action, get } from '@blabbing/signals';
import { type Producer } from 'immer';
import { patch, nothing } from '../';

describe('patch', () => {
  it('updates the value immutably', async () => {
    const initialValue = { msg: 'initial' };
    const $value = atom(initialValue);

    const update = action((msg: string) => {
      patch($value, (draft) => {
        draft.msg = msg;
      });
    });

    expect(get($value)).toHaveProperty('msg', 'initial');
    await update('updated');
    expect(get($value)).toHaveProperty('msg', 'updated');

    // Make sure it wasn't mutated.
    expect(initialValue.msg).toBe('initial');
  });

  it('can replace the value with nothing', async () => {
    type Value = undefined | string;
    const $value = atom<Value>('content');

    // Unclear why: TS refuses `nothing` unless you explicitly annotate. Maybe
    // it considers it to be a different symbol.
    const producer: Producer<Value> = () => nothing;

    const unset = action(() => {
      patch($value, producer);
    });

    await unset();
    expect(get($value)).toBeUndefined();
  });
});
