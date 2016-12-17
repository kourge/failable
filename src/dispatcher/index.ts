export interface Handler<T> {
  (a: T): any;
}

export class Dispatcher<State extends string> {
  private allHandlers: {[key: string]: Handler<any>[]} = {};

  constructor(public validStates: State[]) {
    const {allHandlers: handlers} = this;
    for (const state of validStates) {
      handlers[state as string] = [];
    }
  }

  /**
   * Returns the raw handler array of a given state. This is intended for
   * low-level utilities, so there is no guard against mutation.
   */
  handlersOf(state: State): Handler<any>[] {
    const handlers = this.allHandlers[state.toLowerCase()];

    if (handlers === undefined) {
      throw new TypeError(`${state} is not a valid state`);
    }

    return handlers;
  }

  /**
   * Remove every handler for every state. This is behaviorally equivalent to
   * calling `remove` for each state in existence.
   */
  clear(): void {
    for (const state of this.validStates) {
      const handlers = this.handlersOf(state);
      handlers.splice(0, handlers.length);
    }
  }

  /**
   * Given a state and any associated data, invoke all handlers registered under
   * that state with said data, in the order of registration.
   */
  dispatch(state: State, data: any): void {
    for (const handler of this.handlersOf(state)) {
      handler(data);
    }
  }

  /**
   * Registers a `handler` to a `state`. This handler is invoked when `dispatch`
   * is called. To ensure all handlers are invoked, do not throw any errors in
   * any of the handlers.
   */
  addListener(state: State, f: Handler<any>): void {
    const handlers = this.handlersOf(state);

    handlers.push(f);
  }

  /**
   * Unregisters a `handler` from a `state`. If a `handler` is not provided,
   * every handler is removed from that `state`. To prevent unregistration from
   * failing silently, store the initial handler and do not define it as an
   * anonymous function.
   */
  removeListener(state: State, f?: Handler<any>): void {
    const handlers = this.handlersOf(state);

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
