export interface Success<T> {
    error: false;
    data: T;
}
export interface Pending {
    error?: undefined;
    data?: undefined;
}
export interface Failure {
    error: true;
    data: Error;
}
export declare type Failable<T> = Success<T> | Pending | Failure;
export declare function success<T>(data: T): Success<T>;
export declare function failure(data: Error): Failure;
export declare const pending: Pending;
export declare function isSuccess<T>(f: Failable<T>): f is Success<T>;
export declare function isFailure<T>(f: Failable<T>): f is Failure;
export declare function isPending<T>(f: Failable<T>): f is Pending;
export declare function toFailable<T>(f: () => T): Failable<T>;
