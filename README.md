# failable

The `failable` library provides three states that together model operations that
can fail. Each state comes with a creator function and a predicate function:

- The `success(data)` function takes some `data: T` and creates a `Success<T>`.
  Its predicate `isSuccess(x)` returns true if `x` is a `Success<T>`.
- The `failure(error)` function takes some `error: Error` and creates a `Failure`.
  Its predicate `isFailure(x)` returns true if `x` is a `Failure`.
- The `pending` constant does not take anything. Its predicate `isPending(x)`
  returns true if `x` is a `Pending`.

Different sets of these states model different kinds of failable operations, hence
the name `failable`.

- For asynchronous operations, the possible states are `Pending`, `Success<T>`,
  and `Failure`. This is called a `Failable<T>` and is conceptually close to
  a promise.
- For synchronous operations, the possible states are `Success<T>` and `Failure`.
  This is called a `Result<T>` and its closest analog is the result of a function
  that can throw.

## Installation

This package is [published on npm as `failable`](
https://www.npmjs.com/package/failable
). Simply run `npm install --save failable`.

## `Failable<T>`

`Failable<T>` is a plain value analog to `Promise<T>` that can be easily handled
by functional, immutable moving parts, such as React components and Redux
reducers. It is meant to work in conjunction with a promise to "mirror" its
state, with helpers that help fostering the good habit of handling all three
states.

Suppose we are in a React-like environment. An example usage would be:

```js
// Fetching:
import {pending, success, failure} from 'failable';

// `user` explicitly models if the loading of the user is in flight, has succeeded,
// or has failed:
let user = pending;
getUser().then(u => {
  user = success(u);
}, e => {
  user = failure(e);
});


// Rendering:
import {isPending, isSuccess, isFailure} from 'failable';

// Predicate functions are needed to determine which state `user` is in:
if (isPending(user)) {
  return spinner;
} else if (isFailure(user)) {
  console.error(user.data);
  return errorMessage(user.data.message);
} else {
  return renderUser(user.data);
}

// Alternately:
import {when} from 'failable';

// The helper `when` will extract all the data for you:
return when(user, {
  pending: () => spinner,
  failure: e => {
    console.error(e);
    return errorMessage(e.message);
  },
  success: renderUser
});
```

`Failable<T>` very much acts like a constantly materialized version of a promise.
In fact, each state corresponds to [
an internal slots on a Promise as defined by the ECMAScript standard
](
http://www.ecma-international.org/ecma-262/6.0/#sec-properties-of-promise-instances
):

- `Pending` corresponds to when `[[PromiseState]]` is `"pending"`.
- `Success<T>` corresponds to the `"fulfilled"` value of `[[PromiseState]]`.
- `Failure` corresponds to the `"rejected"` value of `[[PromiseState]]`.

## `Result<T>`

`Result<T>` is designed to aid a programming style wherein error signaling is done
through a return value instead of throwing and catching.

Example usages include:

```js
import {failure, success, isSuccess} from 'failable';

// A brand-new function can return a `Failure` or a `Success<T>`:
const separatorNotFound = new Error('Separator not found in string');

function splitStringBy(s, separator) {
  const result = s.split(separator);
  return result.length === 1 ? failure(separatorNotFound) : success(result);
}

// Consumers will have to use predicates to access the result:
let parts = [];
const splits = splitStringBy(input, ',');
if (isSuccess(splits)) {
  parts = splits.data.map(s => s + "\n");
}

// Or better yet, use `when`:
import {when} from 'failable';

const parts = when(splitStringBy(input, ','), {
  success: pieces => pieces.map(s => s + "\n"),
  failure: e => {
    console.error(e);
    return [];
  }
});

// An existing function might already throw:
function splitStringBy(s, separator) {
  const result = s.split(separator);
  if (result.length === 1) {
    throw new Error('Separator not found in string');
  }
  return result;
}

// The existing function's invocation can be wrapped in `Result.from`:
import {Result} from 'failable';
const splits = Result.from(() => splitStringBy(input, ','));
// Now `splits` is a `Result<T>`.
```

## API

The API surface is small, divided into three categories: predicates, creators,
and helpers.

If you're using TypeScript, this package ships with typings. Each state is its
own type, and both the `Failable<T>` type and the `Result<T>` type are defined
as proper tagged unions of multiple states. Each predicate is also a type guard
that properly narrows a wide type where applicable.

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
Not actually a creator but a constant representing the pending state.

### `Result.from(() => T) => Result<T>`
Takes a function and runs it. If the function throws, wrap the thrown error in a
failure. If it does not, wrap its return value in a success.

### `toResult(() => T) => Result<T>`
An alias of `Result.from`.

### `isFailable(any) => boolean`
Takes anything and returns true if the given argument is a `Failable<T>` or a
`Result<T>`.

### `Failable.is(any) => boolean`
An alias of `isFailable`.

### `when(Failable<T>, {pending, success, failure}) => ?`
Takes a `Failable<T>`, an option object of callbacks, and invokes one of those
callbacks, then finally returns whatever the invoked callback returned. Possible
option keys are:

- `success: T => any` (required)
- `failure: Error => any` (required)
- `pending: () => any` (optional)

We encourage that whenever possible, prefer using `when` over any of the
predicate functions.

### `Failable.when(Failable<T>, {pending, success, failure}) => ?`
Similar to a plain `when`, but also dispatches registered listeners. See below for
more details.

### `Failable.addListener(State, Handler)`
Registers a `Handler` to a `State`. Multiple registration is allowed, and handlers
are invoked in the order of registration.

- `Failable.addListener('success', any => any)`: the success handler gains
  access to all success values.
- `Failable.addListener('failure', Error => any)`: the failure handler gains
  access to all failure errors.
- `Failable.addListener('pending', () => any)`: the pending handler gets no
  additional information.

### `Failable.removeListener(State, Handler?)`
The opposite of `Failable.addListener(...)`; deregisters a handler that has been
registered. If given a handler that was not registered previously, it does
nothing. Take care to store an anonymous function if there is plan to deregister
it, since the same function literal generates a different object on each
execution. If given no specific handler, it will register all handlers bound to
that state.

### `Failable.dispatch(State, any)`
Given a `State` and any sort of data, invoke all registered handlers of that state
with the given data where applicable. Used by `Failable.when` to inform listeners.

