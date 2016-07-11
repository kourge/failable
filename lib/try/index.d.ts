import { Failable } from '../common';
export declare class Try<T> {
    failable: Failable<T>;
    constructor(f: Failable<T> | (() => T));
    map<A, B, C>({onSuccess, pending, onFailure}: {
        onSuccess: (data: T) => A;
        onFailure: (error: Error) => B;
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
        (state: 'pending', handler: PendingHandler);
        (state: 'failure', handler: FailureHandler);
        <T>(state: 'success', handler: SuccessHandler<T>);
        (state: State, f: Handler<any>);
    };
    const off: {
        (state: 'pending', handler?: PendingHandler);
        (state: 'failure', handler?: FailureHandler);
        <T>(state: 'success', handler?: SuccessHandler<T>);
        (state: State, f?: Handler<any>);
    };
}
