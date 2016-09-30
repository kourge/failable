"use strict";
var freeze = Object.freeze;
/**
 * Constructs a success, given a value.
 */
function success(data) {
    return freeze({ data: data, error: false });
}
exports.success = success;
/**
 * Constructs a failure, given an error.
 */
function failure(data) {
    return freeze({ data: data, error: true });
}
exports.failure = failure;
/**
 * A representation of the pending state.
 */
exports.pending = freeze({ error: null });
/**
 * Returns true if the given Failable is a success.
 */
function isSuccess(f) {
    return f.error === false;
}
exports.isSuccess = isSuccess;
/**
 * Returns true if the given Failable is a failure.
 */
function isFailure(f) {
    return f.error === true;
}
exports.isFailure = isFailure;
/**
 * Returns true if the given Failable is considered pending.
 */
function isPending(f) {
    return f.error === null;
}
exports.isPending = isPending;
/**
 * Returns true if the given value qualifies as a Failable.
 */
function isFailable(x) {
    return 'error' in x && (x.error === false || x.error === true || x.error === null);
}
exports.isFailable = isFailable;
/**
 * Converts a function's return value into a Failable. If the function returned
 * successfully, the conversion results in a success, but if the function threw an
 * error, the conversion results in a failure. Note that it is not possible to
 * result in a pending state, since a function call is synchronous.
 */
function toFailable(f) {
    try {
        return success(f());
    }
    catch (e) {
        return failure(e);
    }
}
exports.toFailable = toFailable;
