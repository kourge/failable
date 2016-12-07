import {Success, Failure, Pending} from '../common';

/**
 * A Reloading represents a successful value that may soon be replaced with new
 * data, which may either fail or succeed.
 */
export interface Reloading<T> {
  error: null;
  succeeded: true;
  data: T;
}

/**
 * A Retrying represents a failure and its error, but a recovery is being
 * attempted, which may either fail or succeed.
 */
export interface Retrying {
  error: null;
  succeeded: false;
  data: Error;
}

const {freeze} = Object;

/**
 * Constructs a reloading, given a value.
 */
export function reloading<T>(data: T): Reloading<T> {
  return freeze<Reloading<T>>({data, error: null, succeeded: true});
}

/**
 * Constructs a retrying, given an error.
 */
export function retrying(data: Error): Retrying {
  return freeze<Retrying>({data, error: null, succeeded: false});
}

/**
 * Returns true if the given Loadable is considered reloading.
 */
export function isReloading<T>(f: Loadable<T>): f is Reloading<T> {
  return f.error === null && 'succeeded' in f && (f as any).succeeded === true;
}

/**
 * Returns true if the given Loadable is considered retrying.
 */
export function isRetrying<T>(f: Loadable<T>): f is Retrying {
  return f.error === null && 'succeeded' in f && (f as any).succeeded === false;
}

/**
 * A Loadable represents a successful value, a pending state, a failure with an
 * error, a successful value being reloaded, or a failure with an error being
 * retried.
 */
export type Loadable<T> = Success<T> | Failure | Pending | Retrying | Reloading<T>;

