import {
  finalizationQueue,
  finishTransaction,
  startTransaction,
} from './transaction';

/**
 * Transactionally apply a set of changes. Actions should happen in response
 * to IO events.
 */
export const action = <Params extends Array<unknown>, ReturnValue>(
  handler: (...args: Params) => ReturnValue
): Action<Params, ReturnValue> => {
  const transaction = (...params: Params) => {
    if (finalizationQueue !== null) {
      // Only commit in the top level action.
      return handler(...params);
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
