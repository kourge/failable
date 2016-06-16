import {Failable, toFailable, isSuccess, isFailure} from '../common';

export class Try<T> {
  failable: Failable<T>;

  constructor(f: Failable<T> | (() => T)) {
    this.failable = (f instanceof Function) ? toFailable(f) : f;

    this.map({
      onFailure: error => Try._dispatch('failure', error),
      onSuccess: data => Try._dispatch('success', data),
      pending: () => Try._dispatch('pending', undefined)
    });
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
    return allHandlers[state.toLowerCase()];
  }

  export function _dispatch(state: State, data: any): void {
    const handlers = _handlersOf(state) || [];

    for (const handler of handlers) {
      handler(data);
    }
  }

  export const on: {
    (state: 'pending', handler: PendingHandler);
    (state: 'failure', handler: FailureHandler);
    <T>(state: 'success', handler: SuccessHandler<T>);
    (state: State, f: Handler<any>);
  } = _on;

  function _on(state: State, f: Handler<any>): void {
    const handlers = _handlersOf(state);
    if (handlers === undefined) {
      throw new Error(`${state} is not a known state`);
    }

    handlers.push(f);
  }

  export const off: {
    (state: 'pending', handler?: PendingHandler);
    (state: 'failure', handler?: FailureHandler);
    <T>(state: 'success', handler?: SuccessHandler<T>);
    (state: State, f?: Handler<any>);
  } = _off;

  function _off(state: State, f?: Handler<any>): void {
    const handlers = _handlersOf(state);
    if (handlers === undefined) {
      throw new Error(`${state} is not a known state`);
    }

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
