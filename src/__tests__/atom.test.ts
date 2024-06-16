import { atom } from '../atom';
import { action } from '../action';

describe('atom', () => {
  it('holds and returns the initial state', () => {
    const [getState] = atom('initial state');

    expect(getState()).toBe('initial state');
  });

  it('fails if you try to update outside an action', () => {
    const [_, setState] = atom(0);
    const fail = () => setState(1);

    expect(fail).toThrow(/only be updated in an action/);
  });

  it('can replace the current state', () => {
    const [getState, setState] = atom(0);

    const update = action(() => {
      setState(1);
    });

    expect(getState()).toBe(0);
    update();
    expect(getState()).toBe(1);
  });

  it('does not commit changes if the action fails', () => {
    const [getState, setState] = atom(0);

    const update = action(() => {
      setState(1);
      throw new Error('fail');
    });

    expect(getState()).toBe(0);
    expect(update).toThrow('fail');
    expect(getState()).toBe(0);
  });
});
