import {
  finalizationQueue,
  finishTransaction,
  startTransaction,
} from './transaction';

/**
 * Perform an action that updates state all at once.
 */
export const action = <Params extends Array<unknown>, ReturnValue>(
  handler: (...args: Params) => ReturnValue
): Action<Params, ReturnValue> => {
  const transaction = (...params: Params) => {
    if (finalizationQueue !== null) {
      throw new Error('Actions cannot be used inside other actions.');
    }

    try {
      startTransaction();
      const result = handler(...params);
      finishTransaction(true);

      return result;
    } catch (error) {
      finishTransaction(false);
      throw error;
    }
  };

  return transaction;
};

export interface Action<Params extends Array<unknown>, ReturnValue> {
  (...args: Params): ReturnValue;
}
