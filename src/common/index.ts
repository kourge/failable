export interface Failable<T> {
  error?: boolean;
  data?: T | Error;
}

export interface Success<T> extends Failable<T> {
  data: T;
}

export interface Failure extends Failable<Error> {
  data: Error;
  error: boolean;
}

export interface Pending<T> extends Failable<T> {
  data?: T;
}

export function isSuccess<T>(f: Failable<T>): f is Success<T> {
  return !f.error && f.data !== undefined;
}

export function isFailure(f: Failable<any>): f is Failure {
  return !!f.error;
}

export function isPending<T>(f: Failable<T>): f is Pending<T> {
  return !isFailure(f) && f.data === undefined;
}

export function success<T>(value: T): Success<T> {
  return {data: value};
}

export function failure(error: Error): Failure {
  return {error: true, data: error};
}

export const pending: Pending<any> = {data: undefined};

export function toFailable<T>(f: () => T): Failable<T> {
  try {
    return success(f());
  } catch (e) {
    return failure(e);
  }
}
