import { BRAND } from './brand';

/**
 * A behavior is a writable sink that schedules an effect to run after the
 * transaction commits. They are the primary method of performing side
 * effects.
 */
export const behavior = <Instruction>(
  run: (input: Instruction) => void | Promise<void>
): Behavior<Instruction> => {
  return Object.defineProperties({} as Behavior<Instruction>, {
    [BRAND]: { value: 'B' },
    _e: { value: run },
  });
};

export interface Behavior<Instruction> {
  /**
   * Identifies the sink type.
   * @private
   */
  [BRAND]: 'B';

  /**
   * Effect executed when the transaction commits.
   * @private
   */
  _e: (input: Instruction) => void | Promise<void>;
}
