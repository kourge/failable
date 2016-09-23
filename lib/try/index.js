"use strict";
var common_1 = require('../common');
var Try = (function () {
    function Try(f) {
        this.failable = (f instanceof Function) ? common_1.toFailable(f) : f;
        try {
            this.on({
                failure: function (error) { return Try._dispatch('failure', error); },
                success: function (data) { return Try._dispatch('success', data); },
                pending: function () { return Try._dispatch('pending', undefined); }
            });
        }
        catch (_) {
            throw new TypeError("Invariant violation: " + f + " is not a Failable");
        }
    }
    Try.prototype.on = function (_a) {
        var onSuccess = _a.success, onPending = _a.pending, onFailure = _a.failure;
        var f = this.failable;
        if (common_1.isSuccess(f)) {
            return onSuccess(f.data);
        }
        else if (common_1.isFailure(f)) {
            return onFailure(f.data);
        }
        else if (common_1.isPending(f) && onPending) {
            return onPending();
        }
        throw new TypeError('Invariant violation: this Try does not wrap a Failable');
    };
    return Try;
}());
exports.Try = Try;
var Try;
(function (Try) {
    var allHandlers = {
        pending: [], failure: [], success: []
    };
    function _handlersOf(state) {
        var handlers = allHandlers[state.toLowerCase()];
        if (handlers === undefined) {
            throw new TypeError(state + " is not a valid state");
        }
        return handlers;
    }
    Try._handlersOf = _handlersOf;
    function _dispatch(state, data) {
        for (var _i = 0, _a = _handlersOf(state); _i < _a.length; _i++) {
            var handler = _a[_i];
            handler(data);
        }
    }
    Try._dispatch = _dispatch;
    Try.on = _on;
    function _on(state, f) {
        var handlers = _handlersOf(state);
        handlers.push(f);
    }
    Try.off = _off;
    function _off(state, f) {
        var handlers = _handlersOf(state);
        if (!f) {
            handlers.splice(0, handlers.length);
            return;
        }
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] === f) {
                handlers.splice(i, 1);
            }
        }
    }
})(Try = exports.Try || (exports.Try = {}));
