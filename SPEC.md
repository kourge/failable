# Specification

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

All failable objects produced by this package are frozen and are therefore
shallowly immutable. Any object with an `error` property set to `null` is
considered a pending failable, even though the `pending` constant itself is
defined as a frozen singleton object.

In TypeScript typings, the convention wherein `data` should be an error object
when `error` is `true` is enforced through types.
