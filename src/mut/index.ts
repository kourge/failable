import {observable, action, computed} from 'mobx';

/**
 * Failable is a reactive MobX counterpart to a Promise. It has three states:
 * pending, success, and failure. When constructed, it starts out in the pending
 * state.
 *
 * The action methods `success`, `failure`, and `pending` are used to change
 * between these states. The computed properties indicate the current state,
 * but for day-to-day usage, prefer the `match` method.
 */
export class Failable<T> {
  @observable protected data: T | Error | undefined = undefined;
  @observable protected state: Failable.State = State.pending;

  /**
   * Indicates if this Failable is a success.
   */
  @computed get isSuccess(): boolean { return this.state === State.success; }

  /**
   * Indicates if this Failable is a failure.
   */
  @computed get isFailure(): boolean { return this.state === State.failure; }

  /**
   * Indicates if this Failable is pending.
   */
  @computed get isPending(): boolean { return this.state === State.pending; }

  /**
   * Sets this Failable to a success.
   * @param data The value associated with the success.
   * @returns This, enabling chaining.
   */
  @action.bound success(data: T): this {
    this.state = State.success;
    this.data = data;
    this.didBecomeSuccess(data);
    return this;
  }

  /**
   * A lifecycle method that is invoked after this Failable becomes a success.
   * This can be overridden in a subclass.
   */
  protected didBecomeSuccess(_data: T): void {}

  /**
   * Sets this Failable to a failure.
   * @param error The error associated with the failure.
   * @returns This, enabling chaining.
   */
  @action.bound failure(error: Error): this {
    this.state = State.failure;
    this.data = error;
    this.didBecomeFailure(error);
    return this;
  }

  /**
   * A lifecycle method that is invoked after this Failable becomes a success.
   * This can be overridden in a subclass.
   */
  protected didBecomeFailure(_error: Error): void {}

  /**
   * Sets this Failable to pending.
   * @returns This, enabling chaining.
   */
  @action.bound pending(): this {
    this.state = State.pending;
    this.data = undefined;
    this.didBecomePending();
    return this;
  }

  /**
   * A lifecycle method that is invoked after this Failable becomes pending.
   * This can be overridden in a subclass.
   */
  protected didBecomePending(): void {}

  /**
   * Invokes one of the provided callbacks that corresponds this Failable's
   * current state.
   * @param options An object of callbacks to be invoked according to the state.
   * @returns The return value of whichever callback was selected.
   */
  match<A, B, C>(options: Failable.MatchOptions<T, A, B, C>): A | B | C {
    const data = this.data;
    const {success, failure, pending} = options;

    switch (this.state) {
      case State.success: return success(data as T);
      case State.failure: return failure(data as Error);
      case State.pending: return pending();
    }
  }

  /**
   * Accepts a promise by immediately setting this Failable to pending, and then
   * either setting this Failable to a success if the promise was fulfilled, or
   * setting this Failable to a failure if the promise was rejected.
   * @param promise A promise to be accepted
   * @returns This, enabling chaining.
   */
  accept(promise: PromiseLike<T>): this {
    this.pending();
    Promise.resolve(promise).then(this.success, this.failure);
    return this;
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
