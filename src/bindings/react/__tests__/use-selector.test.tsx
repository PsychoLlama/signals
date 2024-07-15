/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { atom, action, swap, computed, Atom, get } from '../../../';
import { useSelector } from '../';

describe('useSelector', () => {
  function setup(getValue?: ($msg: Atom<string>) => string) {
    const $msg = atom('initial message');

    const setMessage = action((value: string) => {
      swap($msg, value);
    });

    getValue ??= useSelector;
    const Test = () => {
      const msg = getValue($msg);
      return <div>{msg}</div>;
    };

    const result = render(<Test />);

    return {
      $msg,
      result,
      setMessage: async (msg: string) => {
        await act(async () => {
          setMessage(msg);
          await Promise.resolve(); // Wait for watcher microtask.
        });
      },
    };
  }

  it('captures the current state of the atom', () => {
    const { result } = setup();

    expect(result.container).toHaveTextContent('initial message');
  });

  it('updates the component when the atom changes', async () => {
    const { setMessage, result } = setup();

    expect(result.container).toHaveTextContent('initial message');

    await setMessage('first update');
    expect(result.container).toHaveTextContent('first update');

    await setMessage('second update');
    expect(result.container).toHaveTextContent('second update');
  });

  it('detects changes on derived values', async () => {
    const { result, setMessage } = setup(($msg) => {
      const derived = React.useMemo(
        () => computed(() => get($msg).toUpperCase()),
        []
      );

      return useSelector(derived);
    });

    expect(result.container).toHaveTextContent('INITIAL MESSAGE');

    await setMessage('new message');
    expect(result.container).toHaveTextContent('NEW MESSAGE');
  });
});
