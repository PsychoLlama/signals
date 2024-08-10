import { external, get, Signal } from '../';

describe('external', () => {
  it('returns the snapshot read outside an effect', () => {
    let source = 'snapshot #1';

    const value = external(
      () => source,
      () => vi.fn()
    );

    expect(get(value)).toBe(source);
    source = 'snapshot #2';
    expect(get(value)).toBe(source);
  });

  it('triggers the subscriber when observed', () => {
    const subscribe = vi.fn(() => vi.fn());
    const value = external(() => 'snapshot', subscribe);

    const computed = new Signal.Computed(() => get(value));
    computed.get(); // Collect dependencies.
    const watcher = new Signal.subtle.Watcher(vi.fn());

    expect(subscribe).not.toHaveBeenCalled();
    watcher.watch(computed);
    expect(subscribe).toHaveBeenCalled();
  });

  it('unsubscribes when nothing is observing it anymore', () => {
    const unsubscribe = vi.fn();
    const value = external(
      () => 'snapshot',
      () => unsubscribe
    );

    const computed = new Signal.Computed(() => get(value));
    computed.get(); // Collect dependencies.
    const watcher = new Signal.subtle.Watcher(vi.fn());

    expect(unsubscribe).not.toHaveBeenCalled();
    watcher.watch(computed);
    expect(unsubscribe).not.toHaveBeenCalled();
    watcher.unwatch(computed);
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('notifies watchers when the snapshot updates', () => {
    const emitter = new EventTarget();
    let count = 0;

    const value = external(
      () => count,
      (onChange) => {
        emitter.addEventListener('change', onChange);
        return () => emitter.removeEventListener('change', onChange);
      }
    );

    const computed = new Signal.Computed(() => get(value));
    computed.get(); // Collect dependencies.

    const changeCallback = vi.fn();
    const watcher = new Signal.subtle.Watcher(changeCallback);
    watcher.watch(computed);
    expect(changeCallback).not.toHaveBeenCalled();

    count += 1;
    emitter.dispatchEvent(new Event('change'));
    expect(changeCallback).toHaveBeenCalled();
  });
});
