
/**
 * A Success represents a successful value.
 */
export interface Success<T> {
  error: false;
  data: T;
}

/**
 * A Pending represents a pending state and has no associated data.
 */
export interface Pending {
  error: null;
}

/**
 * A Failure represents a failure and its error.
 */
export interface Failure {
  error: true;
  data: Error;
}

/**
 * A Failable represents a successful value, a pending state, or a failure with an
 * error.
 */
export type Failable<T> = Success<T> | Pending | Failure;

const {freeze} = Object;

/**
 * Constructs a success, given a value.
 */
export function success<T>(data: T): Success<T> {
  return freeze<Success<T>>({data, error: false});
}

/**
 * Constructs a failure, given an error.
 */
export function failure(data: Error): Failure {
  return freeze<Failure>({data, error: true});
}

/**
 * A representation of the pending state.
 */
export const pending: Pending = freeze({error: null});

/**
 * Returns true if the given Failable is a success.
 */
export function isSuccess<T>(f: Failable<T>): f is Success<T> {
  return f.error === false;
}

/**
 * Returns true if the given Failable is a failure.
 */
export function isFailure<T>(f: Failable<T>): f is Failure {
  return f.error === true;
}

/**
 * Returns true if the given Failable is considered pending.
 */
export function isPending<T>(f: Failable<T>): f is Pending {
  return f.error === null;
}

/**
 * Returns true if the given value qualifies as a Failable.
 */
export function isFailable<T>(x: any): x is Failable<T> {
  return 'error' in x && (
    x.error === false || x.error === true || x.error === null
  );
}

/**
 * Converts a function's return value into a Failable. If the function returned
 * successfully, the conversion results in a success, but if the function threw an
 * error, the conversion results in a failure. Note that it is not possible to
 * result in a pending state, since a function call is synchronous.
 */
export function toFailable<T>(f: () => T): Failable<T> {
  try {
    return success(f());
  } catch (e) {
    return failure(e);
  }
}
