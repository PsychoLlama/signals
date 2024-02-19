import { collectDependencies } from './dependencies';

/**
 * Run a callback without tracking dependencies. This is an escape hatch and
 * should be used sparingly.
 */
export const untracked = <Value>(callback: () => Value) => {
  let value: Value;

  collectDependencies(() => {
    value = callback();
  });

  return value!;
};
