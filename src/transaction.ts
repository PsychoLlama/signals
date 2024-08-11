import type { Atom } from './atom';
import type { Behavior } from './behavior';

/** Queue of changes to apply if the transaction succeeds. */
export let finalizationQueue: null | FinalizationQueue = null;

/** Queue of effects to execute if the transaction succeeds. */
export let effectQueue: EffectQueue = new Map();

export const startTransaction = () => {
  finalizationQueue = new Map();
};

export const finishTransaction = (
  commit: boolean
): (() => Promise<unknown>) => {
  finalizationQueue!.forEach((finalize) => finalize(commit));
  finalizationQueue = null;

  const scheduledEffects = effectQueue;
  effectQueue = new Map();

  return function runEffects() {
    return Promise.all(
      [...scheduledEffects.values()].map((effect) => effect())
    );
  };
};

type EffectQueue = Map<Behavior<unknown>, () => void | Promise<void>>;
type FinalizationQueue = Map<Atom<unknown>, (commit: boolean) => void>;
