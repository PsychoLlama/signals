import {
  collectDependencies,
  DependencyRef,
  Unsubscribe,
} from './dependencies';

/**
 * A callback that re-runs whenever its dependencies change. Dependencies are
 * selectors or signals, and are detected automatically.
 *
 * Optionally return a cleanup handler that runs whenever dependencies change.
 */
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
    newDependencies.forEach((subscribe) => {
      tombstones.delete(subscribe);
      if (dependencies.has(subscribe)) return;
      dependencies.set(subscribe, subscribe(runEffect));
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
