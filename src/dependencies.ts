import { queueBatchedTask } from './batch';

export const callstack: DependencyCollector[] = [];

export const collectDependencies = (callback: Callback): Set<DependencyRef> => {
  const dependencies = new Set<DependencyRef>();
  callstack.push((subscribe) => dependencies.add(subscribe));

  try {
    callback();
  } finally {
    callstack.pop();
  }

  return dependencies;
};

/** If the caller is invoked under an effect, track it as a dependency. */
export const trackDependency = (ref: DependencyRef) => {
  const collector = callstack[callstack.length - 1];
  collector?.(ref);
};

/** Create a dependency reference. This is used to track changes. */
export const createRef = (
  effect?: () => Unsubscribe
): [ref: DependencyRef, onChange: Callback] => {
  const observers = new Set<Callback>();
  let version = 0;
  let cleanup: Unsubscribe | undefined;

  const ref: DependencyRef = {
    v: () => version,
    s: (callback) => {
      if (observers.size === 0) {
        cleanup = effect?.();
      }

      observers.add(callback);

      return () => {
        observers.delete(callback);

        if (observers.size === 0) {
          cleanup?.();
        }
      };
    },
  };

  return [
    ref,
    function onChange() {
      version++;
      observers.forEach(queueBatchedTask);
    },
  ];
};

interface DependencyCollector {
  (signal: DependencyRef): void;
}

export interface DependencyRef {
  /** Subscribe to changes. Returns an unsubscribe callback. */
  s: (callback: Callback) => Unsubscribe;

  /** Get the incrementing version number. Used for caching. */
  v: () => number;
}

export interface Callback {
  (): void;
}

export interface Unsubscribe {
  (): void;
}
