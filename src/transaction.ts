import type { Atom } from './atom';
import type { Behavior } from './behavior';

/** Queue of changes to apply if the transaction succeeds. */
export let finalizationQueue: null | FinalizationQueue = null;

/** Queue of effects to execute if the transaction succeeds. */
export let effectQueue: EffectQueue = new Map();

let runEffectsOnCommit = true;

export const startTransaction = () => {
  finalizationQueue = new Map();
};

const collectEffects = () => {
  const pendingEffects = effectQueue;
  effectQueue = new Map();

  return async () => {
    await Promise.all([...pendingEffects.values()].map((effect) => effect()));
  };
};

export const finishTransaction = (commit: boolean) => {
  finalizationQueue!.forEach((finalize) => finalize(commit));
  finalizationQueue = null;

  if (runEffectsOnCommit) {
    const runEffects = collectEffects();

    if (commit) {
      // Errors should be handled as callbacks to the behavior. If the error
      // bubbled this far, it's too late. Let it fail.
      //
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      runEffects();
    }
  }
};

/**
 * Run an action, but suspend all effects until the returned callback is
 * invoked. Useful for testing.
 */
export const suspendEffects = (callback: () => void): (() => Promise<void>) => {
  try {
    runEffectsOnCommit = false;
    callback();
    return collectEffects();
  } finally {
    runEffectsOnCommit = true;
  }
};

type EffectQueue = Map<Behavior<unknown>, () => void | Promise<void>>;
type FinalizationQueue = Map<Atom<unknown>, (commit: boolean) => void>;
