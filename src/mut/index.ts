import {IObservableValue, observable, action, computed} from 'mobx';

/**
 * AbstractFailable is an imcomplete superclass of Failable designed to work
 * around TypeScript-related subclassing issues.
 *
 * When MobX creates an action on a property, it defines a setter on that
 * property to prevent any external consumers from overwriting that property.
 * This directly clashes with the way TypeScript emits subclassing code below
 * ES6. The net effect is that any class method decorated as a MobX action
 * cannot be overridden in TypeScript. The compilation will succeed, but at
 * runtime it violates the MobX invariant and fails.
 *
 * Curiously, attempting this with a native Node class succeeds, which indicates
 * a difference in how subclasses are implemented across runtimes.
 */
export class AbstractFailable<T> {
  protected data: IObservableValue<T | Error | undefined>;
  protected state: IObservableValue<Failable.State>;

  constructor() {
    this.data = observable.box(undefined, 'data');
    this.state = observable.box<Failable.State>(State.pending, 'state');
  }

  /**
   * Indicates if this Failable is a success.
   */
  @computed get isSuccess(): boolean { return this.state.get() === State.success; }

  /**
   * Indicates if this Failable is a failure.
   */
  @computed get isFailure(): boolean { return this.state.get() === State.failure; }

  /**
   * Indicates if this Failable is pending.
   */
  @computed get isPending(): boolean { return this.state.get() === State.pending; }

  /**
   * Sets this Failable to a success.
   * @param data The value associated with the success.
   */
  protected success(data: T): this {
    this.state.set(State.success);
    this.data.set(data);
    return this;
  }

  /**
   * Sets this Failable to a failure.
   * @param error The error associated with the failure.
   */
  protected failure(error: Error): this {
    this.state.set(State.failure);
    this.data.set(error);
    return this;
  }

  /**
   * Sets this Failable to pending.
   */
  protected pending(): this {
    this.state.set(State.pending);
    this.data.set(undefined);
    return this;
  }

  /**
   * Invokes one of the provided callbacks that corresponds this Failable's
   * current state, and passes along the return value of whichever callback
   * was selected.
   * @param options An object of callbacks to be invoked according to the state.
   */
  match<A, B, C>(options: Failable.MatchOptions<T, A, B, C>): A | B | C {
    const data = this.data.get();
    const {success, failure, pending} = options;

    switch (this.state.get()) {
      case State.success: return success(data as T);
      case State.failure: return failure(data as Error);
      case State.pending: return pending();
    }
  }
}

/**
 * Failable is a reactive MobX counterpart to a Promise. It has three states:
 * pending, success, and failure. When constructed, it starts out in the pending
 * state.
 *
 * The action methods `success`, `failure`, and `pending` are used to change
 * between these states. The computed properties indicate the current state,
 * but for day-to-day usage, prefer the `match` method.
 */
export class Failable<T> extends AbstractFailable<T> {
  /**
   * Sets this Failable to a success.
   * @param data The value associated with the success.
   */
  @action.bound public success(data: T): this {
    return super.success(data);
  }

  /**
   * Sets this Failable to a failure.
   * @param error The error associated with the failure.
   */
  @action.bound public failure(error: Error): this {
    return super.failure(error);
  }

  /**
   * Sets this Failable to pending.
   */
  @action.bound public pending(): this {
    return super.pending();
  }
}

export namespace Failable {
  /**
   * State represents the three possible states that a Failable can fall under.
   */
  export type State = State.Pending | State.Success | State.Failure;

  export namespace State {
    export const pending = 'pending';
    export type Pending = typeof pending;

    export const success = 'success';
    export type Success = typeof success;

    export const failure = 'failure';
    export type Failure = typeof failure;
  }

  /**
   * MatchOptions is an object filled with callbacks. The `success` callback
   * receives whatever success value was just set. The `failure` callback
   * receives whatever error was just set. The `pending` callback does not
   * receive any values.
   */
  export interface MatchOptions<T, A, B, C> {
    success: (data: T) => A;
    failure: (error: Error) => B;
    pending: () => C;
  }
}

const State = Failable.State;
