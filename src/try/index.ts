import {
  Failable, isFailable, toFailable,
  isSuccess, isFailure, isPending
} from '../common';

/**
 * Try is a wrapper class around a Failable to streamline the handling and
 * manipulation of one.
 */
export class Try<T> {
  failable: Failable<T>;

  /**
   * Constructs a Try out of an existing failable or a function that can throw.
   * For the latter use case, `toFailable` is used to convert the function's result
   * into a Failable.
   */
  constructor(f: Failable<T> | (() => T)) {
    const failable = (f instanceof Function) ? toFailable(f) : f;

    if (!isFailable(failable)) {
      throw new TypeError(`Invariant violation: ${f} is not a Failable`);
    }

    this.failable = failable;
    this.on({
      failure: error => Try._dispatch('failure', error),
      success: data => Try._dispatch('success', data),
      pending: () => Try._dispatch('pending', undefined)
    });
  }

  /**
   * Responds to the wrapped Failable, given an option object, which must contain
   * at least the `success` and `failure` callbacks. The return value of any given
   * callback becomes the return value of this method. While it is permissible to
   * omit the `pending` callback, if this is done while the wrapped Failable is
   * considered pending, an error is thrown.
   */
  on<A, B, C>({success: onSuccess, pending: onPending, failure: onFailure}: {
    success: (data: T) => A,
    failure: (error: Error) => B,
    pending?: () => C
  }): A | B | C {
    const {failable: f} = this;

    if (isSuccess(f)) {
      return onSuccess(f.data);
    } else if (isFailure(f)) {
      return onFailure(f.data);
    } else if (isPending(f) && onPending) {
      return onPending();
    }

    throw new TypeError('Called `on` without a pending handler when the failable is pending');
  }
}

export namespace Try {
  export interface Handler<T> {
    (a: T): any;
  }

  export interface PendingHandler extends Handler<void> {}
  export interface FailureHandler extends Handler<Error> {}
  export interface SuccessHandler<T> extends Handler<T> {}
  export type State = 'pending' | 'failure' | 'success';

  const allHandlers: {[key: string]: Handler<any>[]} = {
    pending: [], failure: [], success: []
  };

  export function _handlersOf(state: State): Handler<any>[] {
    const handlers = allHandlers[state.toLowerCase()];

    if (handlers === undefined) {
      throw new TypeError(`${state} is not a valid state`);
    }

    return handlers;
  }

  export function _dispatch(state: State, data: any): void {
    for (const handler of _handlersOf(state)) {
      handler(data);
    }
  }

  /**
   * Registers a `handler` to a `state`. On every Try instantiation, the handlers
   * corresponding to the wrapped Failable's state are invoked, in the order of
   * registration. To ensure all handlers are invoked, do not throw any errors in
   * any of the handlers.
   *
   * For example, `Try.on('failure', error => console.log(error))` will log every
   * error contained in any failure Failable wrapped by Try.
   */
  export const on: {
    (state: 'pending', handler: PendingHandler): void;
    (state: 'failure', handler: FailureHandler): void;
    <T>(state: 'success', handler: SuccessHandler<T>): void;
    (state: State, f: Handler<any>): void;
  } = _on;

  function _on(state: State, f: Handler<any>): void {
    const handlers = _handlersOf(state);

    handlers.push(f);
  }

  /**
   * Unregisters a `handler` from a `state`. To prevent unregistration from failing
   * silently, store the initial handler and do not define it as an anonymous
   * function.
   */
  export const off: {
    (state: 'pending', handler?: PendingHandler): void;
    (state: 'failure', handler?: FailureHandler): void;
    <T>(state: 'success', handler?: SuccessHandler<T>): void;
    (state: State, f?: Handler<any>): void;
  } = _off;

  function _off(state: State, f?: Handler<any>): void {
    const handlers = _handlersOf(state);

    if (!f) {
      handlers.splice(0, handlers.length);
      return;
    }

    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i] === f) {
        handlers.splice(i, 1);
      }
    }
  }
}
