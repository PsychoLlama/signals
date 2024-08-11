import {
  finalizationQueue,
  finishTransaction,
  startTransaction,
} from './transaction';

/**
 * Respond to an IO event by updating state. If an action fails, pending
 * changes are not committed.
 *
 * Actions can trigger effects by writing to "behaviors". Behaviors execute
 * after the action completes, and the promise that is returned resolves when
 * those behaviors finish executing.
 */
export const action = <Params extends Array<unknown>, ReturnValue>(
  handler: (...args: Params) => ReturnValue
): Action<Params, ReturnValue> => {
  const transaction = async (...params: Params): Promise<ReturnValue> => {
    if (finalizationQueue !== null) {
      throw new Error('Actions cannot call other actions.');
    }

    try {
      startTransaction();
      const actionReturnValue = handler(...params);

      const runEffects = finishTransaction(true);
      await runEffects();

      return actionReturnValue;
    } catch (error) {
      finishTransaction(false);
      throw error;
    }
  };

  return transaction;
};

export interface Action<Params extends Array<unknown>, ReturnValue> {
  (...args: Params): Promise<ReturnValue>;
}
