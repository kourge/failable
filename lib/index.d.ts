export interface Failable<T> {
    error?: boolean;
    data?: T | Error;
}
export interface Success<T> extends Failable<T> {
    data: T;
}
export interface Failure extends Failable<Error> {
    data: Error;
    error: boolean;
}
export interface Pending<T> extends Failable<T> {
    data?: T;
}
export declare function isSuccess<T>(f: Failable<T>): f is Success<T>;
export declare function isFailure(f: Failable<any>): f is Failure;
export declare function isPending<T>(f: Failable<T>): f is Pending<T>;
export declare function success<T>(value: T): Success<T>;
export declare function failure(error: Error): Failure;
export declare const pending: Pending<any>;
export declare function toFailable<T>(f: () => T): Failable<T>;
export declare class Try<T> {
    failable: Failable<T>;
    constructor(f: Failable<T> | (() => T));
    map<A, B, C>({onSuccess, pending, onFailure}: {
        onSuccess: (data: T) => A;
        onFailure: (error: Error) => B;
        pending?: () => C;
    }): A | B | C;
}
