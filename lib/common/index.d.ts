/**
 * A Success represents a successful value.
 */
export interface Success<T> {
    error: false;
    data: T;
}
/**
 * A Pending represents a pending state and has no associated data.
 */
export interface Pending {
    error: null;
}
/**
 * A Failure represents a failure and its error.
 */
export interface Failure {
    error: true;
    data: Error;
}
/**
 * A Failable represents a successful value, a pending state, or a failure with an
 * error.
 */
export declare type Failable<T> = Success<T> | Pending | Failure;
/**
 * Constructs a success, given a value.
 */
export declare function success<T>(data: T): Success<T>;
/**
 * Constructs a failure, given an error.
 */
export declare function failure(data: Error): Failure;
/**
 * A representation of the pending state.
 */
export declare const pending: Pending;
/**
 * Returns true if the given Failable is a success.
 */
export declare function isSuccess<T>(f: Failable<T>): f is Success<T>;
/**
 * Returns true if the given Failable is a failure.
 */
export declare function isFailure<T>(f: Failable<T>): f is Failure;
/**
 * Returns true if the given Failable is considered pending.
 */
export declare function isPending<T>(f: Failable<T>): f is Pending;
/**
 * Returns true if the given value qualifies as a Failable.
 */
export declare function isFailable<T>(x: any): x is Failable<T>;
/**
 * Converts a function's return value into a Failable. If the function returned
 * successfully, the conversion results in a success, but if the function threw an
 * error, the conversion results in a failure. Note that it is not possible to
 * result in a pending state, since a function call is synchronous.
 */
export declare function toFailable<T>(f: () => T): Failable<T>;
