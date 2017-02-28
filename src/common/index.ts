import {Failable} from '../failable';

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
