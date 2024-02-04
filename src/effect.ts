import {
  collectDependencies,
  DependencyRef,
  Unsubscribe,
} from './dependencies';

export const createEffect = (effect: Effect) => {
  const dependencies = new Map<DependencyRef, Unsubscribe>();
  let cleanup: ReturnType<Effect>;

  const runEffect = () => {
    cleanup?.();

    const tombstones = new Map(dependencies);
    const newDependencies = collectDependencies(() => {
      cleanup = effect();
    });

    // Subscribe to new dependencies.
    newDependencies.forEach((handle) => {
      tombstones.delete(handle);
      if (dependencies.has(handle)) return;
      dependencies.set(handle, handle.s(runEffect));
    });

    // Unsubscribe from unused dependencies.
    tombstones.forEach((dispose) => dispose());
  };

  runEffect();

  return function dispose() {
    dependencies.forEach((dispose) => dispose());
    cleanup?.();
  };
};

interface Effect {
  (): void | Cleanup;
}

interface Cleanup {
  (): void;
}
