"use strict";
var freeze = Object.freeze;
function success(data) {
    return freeze({ data: data, error: false });
}
exports.success = success;
function failure(data) {
    return freeze({ data: data, error: true });
}
exports.failure = failure;
exports.pending = freeze({ error: null });
function isSuccess(f) {
    return f.error === false;
}
exports.isSuccess = isSuccess;
function isFailure(f) {
    return f.error === true;
}
exports.isFailure = isFailure;
function isPending(f) {
    return f.error === null;
}
exports.isPending = isPending;
function toFailable(f) {
    try {
        return success(f());
    }
    catch (e) {
        return failure(e);
    }
}
exports.toFailable = toFailable;
