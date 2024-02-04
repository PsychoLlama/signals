import { Callback } from './dependencies';

export const batch = <Value>(callback: () => Value): Value => {
  if (currentBatch !== null) {
    return callback();
  }

  let value: Value;

  try {
    currentBatch = new Set();
    value = callback();
    currentBatch.forEach((task) => task());
  } finally {
    currentBatch = null;
  }

  return value;
};

export const queueBatchedTask = (callback: Callback) => {
  if (currentBatch === null) {
    callback();
  } else {
    currentBatch.add(callback);
  }
};

let currentBatch: null | Set<Callback> = null;
