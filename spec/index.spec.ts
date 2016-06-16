import {expect} from 'chai';

import {toFailable, isSuccess, isFailure} from '../src';

describe('toFailable', () => {
  it('produces a Success<T> when the function returns without throwing', () => {
    const result = toFailable(() => 'foo');

    expect(isSuccess(result)).to.be.true;
  });

  it('produces a Failure when the the function throws', () => {
    const result = toFailable((): string => {
      throw new Error();
    });

    expect(isFailure(result)).to.be.true;
  });
});
