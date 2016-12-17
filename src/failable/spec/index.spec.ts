import {expect} from 'chai';

import {Failable} from '..';
import {success, pending, failure} from '../../common';

const aSuccess = success(42);
const aFailure = failure(new Error('no meaning found'));

describe('Failable.is', () => {
  it('returns true for a success', () => {
    expect(Failable.is(aSuccess)).to.be.true;
  });

  it('returns true for a failure', () => {
    expect(Failable.is(aFailure)).to.be.true;
  });

  it('returns true for pending', () => {
    expect(Failable.is(pending)).to.be.true;
  });

  it('returns false for an empty object', () => {
    expect(Failable.is({})).to.be.false;
  });
});

describe('Failable.when', () => {
  let successCalled = false;
  let failureCalled = false;
  let pendingCalled = false;

  function reset() {
    successCalled = false;
    failureCalled = false;
    pendingCalled = false;
  }
  beforeEach(reset);

  const incompleteOptions = {
    success() { successCalled = true; },
    failure() { failureCalled = true; }
  };

  const options = {
    success() { successCalled = true; },
    failure() { failureCalled = true; },
    pending() { pendingCalled = true; }
  };

  describe('on success', () => {
    it('invokes the success callback', () => {
      Failable.when(aSuccess, options);
      expect(successCalled).to.be.true;
    });

    it('does not invoke the failure callback', () => {
      Failable.when(aSuccess, options);
      expect(failureCalled).to.be.false;
    });

    it('does not invoke the pending callback', () => {
      Failable.when(aSuccess, options);
      expect(pendingCalled).to.be.false;
    });
  });

  describe('on failure', () => {
    it('does not invoke the success callback', () => {
      Failable.when(aFailure, options);
      expect(successCalled).to.be.false;
    });

    it('invokes the failure callback', () => {
      Failable.when(aFailure, options);
      expect(failureCalled).to.be.true;
    });

    it('does not invoke the pending callback', () => {
      Failable.when(aFailure, options);
      expect(pendingCalled).to.be.false;
    });
  });

  describe('when pending', () => {
    it('does not invoke the success callback', () => {
      Failable.when(pending, options);
      expect(successCalled).to.be.false;
    });

    it('does not invoke the failure callback', () => {
      Failable.when(pending, options);
      expect(failureCalled).to.be.false;
    });

    it('invokes the pending callback', () => {
      Failable.when(pending, options);
      expect(pendingCalled).to.be.true;
    });

    it('throws when given an option that does not handle pending', () => {
      expect(() => {
        Failable.when(pending, incompleteOptions);
      }).to.throw(TypeError);
    });

    it('does not throw when given an option that handles pending', () => {
      expect(() => {
        Failable.when(pending, options);
      }).to.not.throw(TypeError);
    });
  });
});
