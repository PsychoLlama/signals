/** Queue of changes to apply if the transaction succeeds. */
export let finalizationQueue: null | FinalizationQueue = null;

export const startTransaction = () => {
  finalizationQueue = [];
};

export const commitTransaction = () => {
  finalizationQueue!.forEach((finalize) => finalize());
  finalizationQueue = null;
};

export const abortTransaction = () => {
  finalizationQueue = null;
};

type FinalizationQueue = Array<() => void>;
