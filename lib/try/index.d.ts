import { Failable } from '../common';
/**
 * Try is a wrapper class around a Failable to streamline the handling and
 * manipulation of one.
 */
export declare class Try<T> {
    failable: Failable<T>;
    /**
     * Constructs a Try out of an existing failable or a function that can throw.
     * For the latter use case, `toFailable` is used to convert the function's result
     * into a Failable.
     */
    constructor(f: Failable<T> | (() => T));
    /**
     * Responds to the wrapped Failable, given an option object, which must contain
     * at least the `success` and `failure` callbacks. The return value of any given
     * callback becomes the return value of this method. While it is permissible to
     * omit the `pending` callback, if this is done while the wrapped Failable is
     * considered pending, an error is thrown.
     */
    on<A, B, C>({success: onSuccess, pending: onPending, failure: onFailure}: {
        success: (data: T) => A;
        failure: (error: Error) => B;
        pending?: () => C;
    }): A | B | C;
}
export declare namespace Try {
    interface Handler<T> {
        (a: T): any;
    }
    interface PendingHandler extends Handler<void> {
    }
    interface FailureHandler extends Handler<Error> {
    }
    interface SuccessHandler<T> extends Handler<T> {
    }
    type State = 'pending' | 'failure' | 'success';
    function _handlersOf(state: State): Handler<any>[];
    function _dispatch(state: State, data: any): void;
    /**
     * Registers a `handler` to a `state`. On every Try instantiation, the handlers
     * corresponding to the wrapped Failable's state are invoked, in the order of
     * registration. To ensure all handlers are invoked, do not throw any errors in
     * any of the handlers.
     *
     * For example, `Try.on('failure', error => console.log(error))` will log every
     * error contained in any failure Failable wrapped by Try.
     */
    const on: {
        (state: 'pending', handler: PendingHandler): void;
        (state: 'failure', handler: FailureHandler): void;
        <T>(state: 'success', handler: SuccessHandler<T>): void;
        (state: State, f: Handler<any>): void;
    };
    /**
     * Unregisters a `handler` from a `state`. To prevent unregistration from failing
     * silently, store the initial handler and do not define it as an anonymous
     * function.
     */
    const off: {
        (state: 'pending', handler?: PendingHandler): void;
        (state: 'failure', handler?: FailureHandler): void;
        <T>(state: 'success', handler?: SuccessHandler<T>): void;
        (state: State, f?: Handler<any>): void;
    };
}
