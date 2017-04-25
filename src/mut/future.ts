import {Enum} from 'typescript-string-enums';
import {Lazy} from './lazy';

/**
 * Future is a reactive counterpart to a Promise with MobX semantics. It has
 * three states: pending, success, and failure.
 *
 * The methods `success`, `failure`, and `pending` are actions used to change
 * between these states. The read-only properties are computed and indicate the
 * current state, but for day-to-day usage, prefer the `match` method.
 */
export interface Future<T> {
  /**
   * Indicates if this Future is a success.
   */
  readonly isSuccess: boolean;

  /**
   * Indicates if this Future is a failure.
   */
  readonly isFailure: boolean;

  /**
   * Indicates if this Future is pending.
   */
  readonly isPending: boolean;

  /**
   * Sets this Future to a success.
   * @param data The value associated with the success.
   * @returns This, enabling chaining.
   */
  success(data: T): this;

  /**
   * Sets this Future to a failure.
   * @param error The error associated with the failure.
   * @returns This, enabling chaining.
   */
  failure(error: Error): this;

  /**
   * Sets this Future to pending.
   * @returns This, enabling chaining.
   */
  pending(): this;

  /**
   * Invokes one of the provided callbacks that corresponds this Future's
   * current state.
   * @param options An object of callbacks to be invoked according to the state.
   * @returns The return value of whichever callback was selected.
   */
  match<A, B, C>(options: Future.MatchOptions<T, A, B, C>): A | B | C;

  /**
   * Accepts a promise by immediately setting this Future to pending, and then
   * either setting this Future to a success if the promise was fulfilled, or
   * setting this Future to a failure if the promise was rejected.
   * @param promise A promise to be accepted
   * @returns This, enabling chaining.
   */
  accept(promise: PromiseLike<T>): this;

  /**
   * Returns this Future's success value if it is a success, or the provided
   * default value if it is not.
   * @param defaultValue A possibly lazy value to use in case of non-success
   * @returns This Future's success value or the provided default value
   */
  successOr<U>(defaultValue: Lazy<U>): T | U;

  /**
   * Returns this Future's error value if it is a failure, or the provided
   * default value if it is not.
   * @param defaultValue A possibly lazy value to use in case of non-failure
   * @returns this Future's failure error or the provided default value
   */
  failureOr<U>(defaultValue: Lazy<U>): Error | U;
}

export namespace Future {
  // tslint:disable-next-line:variable-name
  export const State = Enum('pending', 'success', 'failure');
  /**
   * State represents the three possible states that a Future can fall under.
   */
  export type State = Enum<typeof State>;

  /**
   * MatchOptions is an object filled with callbacks. The `success` callback
   * receives whatever success value was just set. The `failure` callback
   * receives whatever error was just set. The `pending` callback does not
   * receive any values.
   */
  export interface MatchOptions<T, A, B, C> {
    success: (data: T) => A;
    failure: (error: Error) => B;
    pending: () => C;
  }
}
