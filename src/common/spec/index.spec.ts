import {expect} from 'chai';

import {
  success, failure, pending,
  isSuccess, isFailure, isPending
} from '..';

const aSuccess = success(42);
const aFailure = failure(new Error('no meaning found'));

describe('success', () => {
  it('freezes its result', () => {
    expect(aSuccess).to.be.frozen;
  });
});

describe('failure', () => {
  it('freezes its result', () => {
    expect(aFailure).to.be.frozen;
  });
});

describe('pending', () => {
  it('is frozen', () => {
    expect(pending).to.be.frozen;
  });
});

describe('isSuccess', () => {
  it('returns true for a success', () => {
    expect(isSuccess(aSuccess)).to.be.true;
  });

  it('returns false for a failure', () => {
    expect(isSuccess(aFailure)).to.be.false;
  });

  it('returns false for pending', () => {
    expect(isSuccess(pending)).to.be.false;
  });
});

describe('isFailure', () => {
  it('returns false for a success', () => {
    expect(isFailure(aSuccess)).to.be.false;
  });

  it('returns true for a failure', () => {
    expect(isFailure(aFailure)).to.be.true;
  });

  it('returns false for pending', () => {
    expect(isFailure(pending)).to.be.false;
  });
});

describe('isPending', () => {
  it('returns false for a success', () => {
    expect(isPending(aSuccess)).to.be.false;
  });

  it('returns false for a failure', () => {
    expect(isPending(aFailure)).to.be.false;
  });

  it('returns true for pending', () => {
    expect(isPending(pending)).to.be.true;
  });
});
