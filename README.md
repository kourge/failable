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

## API

See [`API.md`](https://github.com/UrbanDoor/failable/blob/master/API.md) for
detailed documentation.
