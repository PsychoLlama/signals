import { collectDependencies } from './dependencies';
import { SignalRef } from './signal';

export const createMemo = <Value>(selector: Selector<Value>) => {
  let cache: [version: VersionSnapshot, value: Value];
  let deps: Set<SignalRef>;
  let value: Value;

  const getVersionSnapshot = (): VersionSnapshot => {
    const sources = new Map();

    deps.forEach((signal) => {
      sources.set(signal, signal.v());
    });

    return sources;
  };

  const cacheIsStale = (): boolean => {
    const newSnapshot = getVersionSnapshot();

    for (const [signal, version] of cache[0]) {
      if (newSnapshot.get(signal) !== version) {
        return true;
      }
    }

    return false;
  };

  return () => {
    if (!deps || cacheIsStale()) {
      deps = collectDependencies(() => {
        value = selector();
      });

      cache = [getVersionSnapshot(), value];
    }

    return cache[1];
  };
};

interface Selector<Value> {
  (): Value;
}

type VersionSnapshot = Map<SignalRef, number>;
