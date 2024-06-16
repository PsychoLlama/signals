/** Queue of changes to apply if the transaction succeeds. */
export let finalizationQueue: null | FinalizationQueue = null;

export const startTransaction = () => {
  finalizationQueue = [];
};

export const finishTransaction = (commit: boolean) => {
  finalizationQueue!.forEach((finalize) => finalize(commit));
  finalizationQueue = null;
};

type FinalizationQueue = Array<(commit: boolean) => void>;
