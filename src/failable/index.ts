import {
  Success, Pending, Failure,
  isSuccess, isPending, isFailure
} from '../common';

/**
 * A Failable represents a successful value, a pending state, or a failure with an
 * error.
 */
export type Failable<T> = Success<T> | Pending | Failure;

export namespace Failable {
  /**
   * Returns true if the given value qualifies as a Failable<T> or Result<T>.
   */
  export function is<T>(x: any): x is Failable<T> {
    return 'error' in x && (
      x.error === false || x.error === true || x.error === null
    );
  }

  /**
   * A WhenOptions represents a set of callbacks taken by `when`.
   */
  export interface WhenOptions<T, A, B, C> {
    success: (data: T) => A;
    failure: (error: Error) => B;
    pending?: () => C;
  }

  const dispatchOptions: WhenOptions<any, void, void, void> = {
    success: (data: any) => dispatch('success', data),
    pending: () => dispatch('pending', undefined),
    failure: (data: Error) => dispatch('failure', data)
  };

  /**
   * Responds to the given Failable, given an option object, which must contain
   * at least the `success` and `failure` callbacks. The return value of any given
   * callback becomes the return value of this method. While it is permissible to
   * omit the `pending` callback, if this is done while the given Failable is
   * considered pending, an error is thrown.
   *
   * This version of `when` will call `Failable.dispatch` with the right state,
   * allowing observers access to every failable that goes through it.
   */
  export function when<T, A, B, C>(
    f: Failable<T>, 
    options: WhenOptions<T, A, B, C>
  ): A | B | C {
    _when(f, dispatchOptions);
    return _when(f, options);
  }

  export interface Handler<T> {
    (a: T): any;
  }

  export type State = 'pending' | 'failure' | 'success';

  const allHandlers: {[key: string]: Handler<any>[]} = {
    pending: [], failure: [], success: []
  };

  /**
   * An internal function that returns the raw handler array of a given state.
   * Do not mutate the return value of this function unless you know what you are
   * doing.
   */
  export function _handlersOf(state: State): Handler<any>[] {
    const handlers = allHandlers[state.toLowerCase()];

    if (handlers === undefined) {
      throw new TypeError(`${state} is not a valid state`);
    }

    return handlers;
  }

  /**
   * Given a state and any associated data, invoke all handlers registered under
   * that state with said data, in the order of registration.
   */
  export function dispatch(state: State, data: any): void {
    for (const handler of _handlersOf(state)) {
      handler(data);
    }
  }

  /**
   * Registers a `handler` to a `state`. On every call to `Failable.when`, the
   * handlers corresponding to the given Failable's state are invoked, in the
   * order of registration. To ensure all handlers are invoked, do not throw any
   * errors in any of the handlers.
   *
   * For example, `Failable.addListener('failure', e => console.log(e))` will
   * log every error contained in any failure Failable passed to `Failable.when`.
   */
  export function addListener(state: State, f: Handler<any>): void {
    const handlers = _handlersOf(state);

    handlers.push(f);
  }

  /**
   * Unregisters a `handler` from a `state`. To prevent unregistration from failing
   * silently, store the initial handler and do not define it as an anonymous
   * function.
   */
  export function removeListener(state: State, f?: Handler<any>): void {
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

export const isFailable = Failable.is;

/**
 * Responds to the given Failable, given an option object, which must contain at
 * least the `success` and `failure` callbacks. The return value of any given
 * callback becomes the return value of this method. While it is permissible to
 * omit the `pending` callback, if this is done while the given Failable is
 * considered pending, an error is thrown.
 */
export function when<T, A, B, C>(
  f: Failable<T>,
  options: Failable.WhenOptions<T, A, B, C>
): A | B | C {
  const {
    success: onSuccess, pending: onPending, failure: onFailure
  } = options;

  if (isSuccess<T>(f)) {
    return onSuccess(f.data);
  } else if (isFailure(f)) {
    return onFailure(f.data);
  } else if (isPending(f) && onPending) {
    return onPending();
  }

  throw new TypeError('Called `when` without a pending handler when the failable is pending');
}

const _when = when;
