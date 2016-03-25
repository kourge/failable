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
var Try = (function () {
    function Try(f) {
        this.failable = (f instanceof Function) ? toFailable(f) : f;
    }
    Try.prototype.map = function (_a) {
        var onSuccess = _a.onSuccess, pending = _a.pending, onFailure = _a.onFailure;
        var f = this.failable;
        if (isSuccess(f)) {
            return onSuccess(f.data);
        }
        else if (isFailure(f)) {
            return onFailure(f.data);
        }
        else if (pending) {
            return pending();
        }
        return undefined;
    };
    return Try;
}());
exports.Try = Try;
