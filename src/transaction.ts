import type { Atom } from './atom';
import type { Behavior } from './behavior';

/** Queue of changes to apply if the transaction succeeds. */
export let finalizationQueue: null | FinalizationQueue = null;

/** Queue of effects to execute if the transaction succeeds. */
export let effectQueue: null | EffectQueue = null;

export const startTransaction = () => {
  finalizationQueue = new Map();
  effectQueue = new Map();
};

export const finishTransaction = (commit: boolean) => {
  finalizationQueue!.forEach((finalize) => finalize(commit));
  finalizationQueue = null;

  if (commit) {
    effectQueue!.forEach((effect) => {
      // TODO: Collect promises in `runEffect` harness.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      effect();
    });
  }
};

type EffectQueue = Map<Behavior<unknown>, () => void | Promise<void>>;
type FinalizationQueue = Map<Atom<unknown>, (commit: boolean) => void>;
