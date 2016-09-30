export interface Success<T> {
  error: false;
  data: T;
}

export interface Pending {
  error: null;
}

export interface Failure {
  error: true;
  data: Error;
}

export type Failable<T> = Success<T> | Pending | Failure;

const {freeze} = Object;

export function success<T>(data: T): Success<T> {
  return freeze<Success<T>>({data, error: false});
}

export function failure(data: Error): Failure {
  return freeze<Failure>({data, error: true});
}

export const pending: Pending = freeze({error: null});

export function isSuccess<T>(f: Failable<T>): f is Success<T> {
  return f.error === false;
}

export function isFailure<T>(f: Failable<T>): f is Failure {
  return f.error === true;
}

export function isPending<T>(f: Failable<T>): f is Pending {
  return f.error === null;
}

export function isFailable<T>(x: any): x is Failable<T> {
  return 'error' in x && (
    x.error === false || x.error === true || x.error === null
  );
}

export function toFailable<T>(f: () => T): Failable<T> {
  try {
    return success(f());
  } catch (e) {
    return failure(e);
  }
}
