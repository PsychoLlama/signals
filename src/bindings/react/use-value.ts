import { useSyncExternalStore, useMemo } from 'react';
import { Computed, Atom, Signal } from '@blabbing/signals';

let pendingChanges: Array<() => void> = [];

function flushPendingChanges() {
  pendingChanges.forEach((cb) => cb());
  pendingChanges = [];
}

/**
 * Get the value of an atom or computed and subscribe to changes.
 */
export const useValue = <Value>(
  store: Atom<Value> | Computed<Value>
): Value => {
  const [subscribe, getSnapshot] = useMemo(() => {
    const getSnapshot = () => store._c.get();

    const subscribe = (onChange: () => void) => {
      const emitChange = () => {
        watcher.watch(); // `.watch()` only subscribes once.
        onChange();
      };

      // Notify React of all changes across all components simultaneously.
      // This must be deferred since certain actions are not allowed inside
      // watchers, such as updating values or reading computed states.
      const watcher = new Signal.subtle.Watcher(() => {
        if (pendingChanges.length === 0) {
          queueMicrotask(flushPendingChanges);
        }

        pendingChanges.push(emitChange);
      });

      watcher.watch(store._c);
      return () => watcher.unwatch(store._c);
    };

    return [subscribe, getSnapshot] as const;
  }, [store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
