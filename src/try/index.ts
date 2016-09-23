import {Failable, toFailable, isSuccess, isFailure} from '../common';

export class Try<T> {
  failable: Failable<T>;

  constructor(f: Failable<T> | (() => T)) {
    this.failable = (f instanceof Function) ? toFailable(f) : f;

    this.on({
      failure: error => Try._dispatch('failure', error),
      success: data => Try._dispatch('success', data),
      pending: () => Try._dispatch('pending', undefined)
    });
  }

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
    } else if (onPending) {
      return onPending();
    }
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
