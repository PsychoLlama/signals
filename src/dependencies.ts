import type { SignalRef } from './signal';

export const callstack: DependencyCollector[] = [];

export const collectDependencies = (callback: () => void): Set<SignalRef> => {
  const dependencies = new Set<SignalRef>();
  callstack.push((subscribe) => dependencies.add(subscribe));

  try {
    callback();
  } finally {
    callstack.pop();
  }

  return dependencies;
};

interface DependencyCollector {
  (signal: SignalRef): void;
}
