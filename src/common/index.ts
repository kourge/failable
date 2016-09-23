export interface Success<T> {
  error: false;
  data: T;
}

export interface Pending {
  error?: undefined;
  data?: undefined;
}

export interface Failure {
  error: true;
  data: Error;
}

export type Failable<T> = Success<T> | Pending | Failure;

const freeze = Object.freeze;

export function success<T>(data: T): Success<T> {
  return freeze<Success<T>>({data, error: false});
}

export function failure(data: Error): Failure {
  return freeze<Failure>({data, error: true});
}

export const pending: Pending = freeze({});

export function isSuccess<T>(f: Failable<T>): f is Success<T> {
  return f.error === false;
}

export function isFailure<T>(f: Failable<T>): f is Failure {
  return f.error === true;
}

export function isPending<T>(f: Failable<T>): f is Pending {
  return typeof f.error === 'undefined';
}

export function toFailable<T>(f: () => T): Failable<T> {
  try {
    return success(f());
  } catch (e) {
    return failure(e);
  }
}
