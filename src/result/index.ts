import {Success, Failure, success, failure} from '../common';

/**
 * A Result represents a successful value or a failure with an error.
 */
export type Result<T> = Success<T> | Failure;

export namespace Result {
  /**
   * Converts a function's return value into a Result. If the function returned
   * successfully, the conversion results in a success, but if the function threw
   * an error, the conversion results in a failure.
   */
  export function from<T>(f: () => T): Result<T> {
    try {
      return success(f());
    } catch (e) {
      return failure(e);
    }
  }
}

export const toResult = Result.from;
