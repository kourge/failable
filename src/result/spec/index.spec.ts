import {expect} from 'chai';

import {Result} from '..';
import {isSuccess, isFailure} from '../../common';

describe('Result.from', () => {
  it('produces a Success<T> when the function returns without throwing', () => {
    const result = Result.from(() => 'foo');

    expect(isSuccess(result)).to.be.true;
  });

  it('produces a Failure when the the function throws', () => {
    const result = Result.from((): string => {
      throw new Error();
    });

    expect(isFailure(result)).to.be.true;
  });
});
