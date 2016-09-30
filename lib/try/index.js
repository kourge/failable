"use strict";
var common_1 = require('../common');
/**
 * Try is a wrapper class around a Failable to streamline the handling and
 * manipulation of one.
 */
var Try = (function () {
    /**
     * Constructs a Try out of an existing failable or a function that can throw.
     * For the latter use case, `toFailable` is used to convert the function's result
     * into a Failable.
     */
    function Try(f) {
        var failable = (f instanceof Function) ? common_1.toFailable(f) : f;
        if (!common_1.isFailable(failable)) {
            throw new TypeError("Invariant violation: " + f + " is not a Failable");
        }
        this.failable = failable;
        this.on({
            failure: function (error) { return Try._dispatch('failure', error); },
            success: function (data) { return Try._dispatch('success', data); },
            pending: function () { return Try._dispatch('pending', undefined); }
        });
    }
    /**
     * Responds to the wrapped Failable, given an option object, which must contain
     * at least the `success` and `failure` callbacks. The return value of any given
     * callback becomes the return value of this method. While it is permissible to
     * omit the `pending` callback, if this is done while the wrapped Failable is
     * considered pending, an error is thrown.
     */
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
        throw new TypeError('Called `on` without a pending handler when the failable is pending');
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
    /**
     * Registers a `handler` to a `state`. On every Try instantiation, the handlers
     * corresponding to the wrapped Failable's state are invoked, in the order of
     * registration. To ensure all handlers are invoked, do not throw any errors in
     * any of the handlers.
     *
     * For example, `Try.on('failure', error => console.log(error))` will log every
     * error contained in any failure Failable wrapped by Try.
     */
    Try.on = _on;
    function _on(state, f) {
        var handlers = _handlersOf(state);
        handlers.push(f);
    }
    /**
     * Unregisters a `handler` from a `state`. To prevent unregistration from failing
     * silently, store the initial handler and do not define it as an anonymous
     * function.
     */
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
