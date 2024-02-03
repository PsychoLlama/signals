import { SubscribeToSignal } from './signal';

export const createEffect = (effect: Effect) => {
  const dependencies = new Map<SubscribeToSignal, Unsubscribe>();
  let cleanup: ReturnType<Effect>;

  const runEffect = () => {
    cleanup?.();

    try {
      const newDependencies = new Set<SubscribeToSignal>();
      const tombstones = new Map(dependencies);

      effectStack.push((subscribe) => newDependencies.add(subscribe));
      cleanup = effect();

      // Subscribe to new dependencies.
      newDependencies.forEach((subscribe) => {
        tombstones.delete(subscribe);
        if (dependencies.has(subscribe)) return;
        dependencies.set(subscribe, subscribe(runEffect));
      });

      // Unsubscribe from unused dependencies.
      tombstones.forEach((dispose) => dispose());
    } finally {
      effectStack.pop();
    }
  };

  runEffect();

  return function dispose() {
    dependencies.forEach((dispose) => dispose());
    cleanup?.();
  };
};

export const effectStack: CurrentEffect[] = [];

interface Effect {
  (): void | (() => void);
}

interface Unsubscribe {
  (): void;
}

interface CurrentEffect {
  (subscribeToSignal: SubscribeToSignal): void;
}
