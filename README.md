# failable

Failable<T> is a plain value analog to Promise<T> that can be easily handled by
functional, immutable moving parts, such as React components and Redux reducers. It
is meant to work in conjunction with a promise to "mirror" its state, with helpers
that help fostering the good habit of handling all three cases.

```js
// Fetching:
import {pending, success, failure} from 'failable';

let user = pending;
getUser().then(u => {
  user = success(u);
}, e => {
  user = failure(e);
});


// Rendering:
import {isPending, isSuccess, isFailure} from 'failable';

if (isPending(user)) {
  return spinner;
} else if (isFailure(user)) {
  console.error(user.data);
  return errorMessage(user.data.message);
} else {
  return renderUser(user.data);
}

// Alternately:
import {Try} from 'failable';

return new Try(user).on({
  pending: () => spinner,
  failure: e => {
    console.error(e);
    return errorMessage(e.message);
  },
  success: renderUser
});
```

## Relation to Promises

A `Failable` is always one of the following three, each of which is analogous to
the [internal slots on a Promise as defined by the ECMAScript standard](http://www.ecma-international.org/ecma-262/6.0/#sec-properties-of-promise-instances):
- _pending_ is the state when a promise is just created. It corresponds to when
  [[PromiseState]] is `"pending"`.
- _success_ is the state when a promise is fulfilled. It corresponds directly
  to the `"fulfilled"` value of [[PromiseState]].
- _failure_ is the state when a promise is rejected. It corresponds directly
  to the `"rejected"` value of [[PromiseState]].

## API

The API surface is small, divided into three categories: predicates, constructors,
and helpers. It also ships with TypeScript typings, wherein each state is its
own type, the `Failable<T>` type is defined as a proper tagged union of the
three states, and each predicate is also a type guard that properly narrows a
wide type where applicable.

### `isPending(Failable<any>) => boolean`
Returns `true` if the given failable is considered pending.

### `isSuccess(Failable<any>) => boolean`
Returns `true` if the given failable is considered a success.

### `isFailure(Failable<any>) => boolean`
Returns `true` if the given failable is considered a failure.

### `success(T) => Failable<T>`
Wraps a `T` and returns a success.

### `failure(Error) => Failable<any>`
Wraps an `Error` and returns a failure, which is considered a `Failable<any>`.

### `pending`
Not actually a constructor but a constant representing the pending state.

### `toFailable(() => T) => Failable<T>`
Takes a function and runs it. If the function throws, wrap the thrown error in a
failure. If it does not, wrap its return value in a success.

### `class Try`
A helper class makes it very convenient to react to all three possible failable
states.

- `constructor(Failable<T> | () => T)`: takes a failable or a function. If given a
  function, said function is converted into a failable using `toFailable`.
- `on({pending, success, failure})`: takes an option object of callbacks, invokes
  one of them, and returns whatever the invoked callback returned. Possible option
  keys are:
  - `success: T => any` (required): invoked when the failable is a success
  - `failure: Error => any` (required): invoked when the failable is a failure
  - `pending: () => any` (optional): invoked when the failable is pending
- `static on(State, Handler)`: registers a `Handler` to a `State`. Multiple
  registration is allowed, and handlers are invoked in the order of registration.
  - `static on('success', any => any)`: the success handler gains access to all
    success values.
  - `static on('failure', Error => any)`: the failure handler gains access to all
    failure errors.
  - `static on('pending', () => any)`: the pending handler gets no additional
    information.
- `static off(State, Handler)`: like `static on(...)`, but deregisters a handler
  that has been registered. If given a handler that was not registered previously,
  it does nothing. Take care to store an anonymous function if there is plan to
  deregister it, since the same function literal generates a different object on
  each execution.

## Definition

A failable:
- MUST have an `error` property

A failable:
- MAY have a `data` property

### `error`

The `error` property MAY be `true`, `false`, or `null`. It MUST NOT be
`undefined`.

- If the value is `true`, then the failable is considered a failure.
- If the value is `false`, then the failable is considered a success.
- If the value is `null`, then the failable is considered pending.

### `data`

The `data` property MAY be any type of value. By convention, if `error` is
`true`, then `data` SHOULD be an error object.

## Internals

All failable objects produced by this module are frozen and are therefore
shallowly immutable. Any object with an `error` property set to `null` is
considered a pending failable, even though the `pending` constant itself is
defined as a frozen singleton object.

The `data` property corresponds to the [[PromiseResult]] internal slot as
defined by the ECMAScript spec. It is recommended that you do not access this
property directly and instead use a helper utility such as the `Try` class.
