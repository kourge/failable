import {Failable, toFailable, isSuccess, isFailure} from '../common';

export class Try<T> {
  failable: Failable<T>;

  constructor(f: Failable<T> | (() => T)) {
    this.failable = (f instanceof Function) ? toFailable(f) : f;
  }

  map<A, B, C>({onSuccess, pending, onFailure}: {
    onSuccess: (data: T) => A,
    onFailure: (error: Error) => B,
    pending?: () => C
  }): A | B | C {
    const {failable: f} = this;

    if (isSuccess(f)) {
      return onSuccess(f.data);
    } else if (isFailure(f)) {
      return onFailure(f.data);
    } else if (pending) {
      return pending();
    }

    return undefined;
  }
}
