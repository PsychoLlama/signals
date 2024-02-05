import { collectDependencies } from './dependencies';

export const untracked = <Value>(callback: () => Value) => {
  let value: Value;

  collectDependencies(() => {
    value = callback();
  });

  return value!;
};
