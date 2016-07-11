"use strict";
function isSuccess(f) {
    return !f.error && f.data !== undefined;
}
exports.isSuccess = isSuccess;
function isFailure(f) {
    return !!f.error;
}
exports.isFailure = isFailure;
function isPending(f) {
    return !isFailure(f) && f.data === undefined;
}
exports.isPending = isPending;
function success(value) {
    return { data: value };
}
exports.success = success;
function failure(error) {
    return { error: true, data: error };
}
exports.failure = failure;
exports.pending = { data: undefined };
function toFailable(f) {
    try {
        return success(f());
    }
    catch (e) {
        return failure(e);
    }
}
exports.toFailable = toFailable;
