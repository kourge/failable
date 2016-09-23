import { Failable } from '../common';
export declare class Try<T> {
    failable: Failable<T>;
    constructor(f: Failable<T> | (() => T));
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
    const on: {
        (state: 'pending', handler: PendingHandler): void;
        (state: 'failure', handler: FailureHandler): void;
        <T>(state: 'success', handler: SuccessHandler<T>): void;
        (state: State, f: Handler<any>): void;
    };
    const off: {
        (state: 'pending', handler?: PendingHandler): void;
        (state: 'failure', handler?: FailureHandler): void;
        <T>(state: 'success', handler?: SuccessHandler<T>): void;
        (state: State, f?: Handler<any>): void;
    };
}
