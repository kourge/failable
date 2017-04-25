import {expect, use} from 'chai';
import {useStrict, computed, when} from 'mobx';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

import {Failable as F} from './failable';
import {Future} from './future';

use(sinonChai);
useStrict(true);

describe('Failable (mutable)', () => {
  class Failable<T> extends F<T> {
    @computed get internalData(): T | Error | undefined { return this.data; }
    @computed get internalState(): Future.State { return this.state; }

    calledSuccess = false;
    didBecomeSuccess(_: T) { this.calledSuccess = true; }

    calledFailure = false;
    didBecomeFailure(_: Error) { this.calledFailure = true; }

    calledPending = false;
    didBecomePending() { this.calledPending = true; }
  }

  const successValue = 3;
  const failureValue = new Error();

  type FailableFactory<T> = {[State in Future.State]: () => Failable<T>};

  const make: FailableFactory<number> = {
    pending: () => new Failable<number>().pending(),
    success: () => new Failable<number>().success(successValue),
    failure: () => new Failable<number>().failure(failureValue)
  };

  describe('constructor', () => {
    const f = new Failable<void>();

    it('initializes the state as pending', () => {
      expect(f.internalState).to.eq(Future.State.pending);
    });
  });

  describe('success', () => {
    let f: Failable<number>;
    beforeEach(() => f = make.success());

    it('sets the internal state to success', () => {
      expect(f.internalState).to.eq(Future.State.success);
    });

    it('sets the internal data to the given value', () => {
      expect(f.internalData).to.eq(successValue);
    });

    it('invokes didBecomeSuccess', () => {
      expect(f.calledSuccess).to.be.true;
      expect(f.calledFailure).to.be.false;
      expect(f.calledPending).to.be.false;
    });
  });

  describe('failure', () => {
    let f: Failable<number>;
    beforeEach(() => f = make.failure());

    it('sets the internal state to failure', () => {
      expect(f.internalState).to.eq(Future.State.failure);
    });

    it('sets the internal data to the given value', () => {
      expect(f.internalData).to.eq(failureValue);
    });

    it('invokes didBecomeFailure', () => {
      expect(f.calledSuccess).to.be.false;
      expect(f.calledFailure).to.be.true;
      expect(f.calledPending).to.be.false;
    });
  });

  describe('pending', () => {
    let f: Failable<number>;
    beforeEach(() => f = make.pending());

    it('sets the internal state to pending', () => {
      expect(f.internalState).to.eq(Future.State.pending);
    });

    it('invokes didBecomePending', () => {
      expect(f.calledSuccess).to.be.false;
      expect(f.calledFailure).to.be.false;
      expect(f.calledPending).to.be.true;
    });
  });

  describe('isSuccess', () => {
    it('is true when success', () => {
      expect(make.success().isSuccess).to.be.true;
    });

    it('is false when failure', () => {
      expect(make.failure().isSuccess).to.be.false;
    });

    it('is false when pending', () => {
      expect(make.pending().isSuccess).to.be.false;
    });
  });

  describe('isFailure', () => {
    it('is false when success', () => {
      expect(make.success().isFailure).to.be.false;
    });

    it('is true when failure', () => {
      expect(make.failure().isFailure).to.be.true;
    });

    it('is false when pending', () => {
      expect(make.pending().isFailure).to.be.false;
    });
  });

  describe('isPending', () => {
    it('is false when success', () => {
      expect(make.success().isPending).to.be.false;
    });

    it('is false when failure', () => {
      expect(make.failure().isPending).to.be.false;
    });

    it('is true when pending', () => {
      expect(make.pending().isPending).to.be.true;
    });
  });

  describe('match', () => {
    let success: sinon.SinonSpy;
    let failure: sinon.SinonSpy;
    let pending: sinon.SinonSpy;
    beforeEach(() => {
      [success, failure, pending] = [sinon.spy(), sinon.spy(), sinon.spy()];
    });

    it('invokes the pending handler', () => {
      make.pending().match({success, failure, pending});

      expect(success).to.not.have.been.called;
      expect(failure).to.not.have.been.called;
      expect(pending).to.have.been.called;
    });

    it('invokes the success handler with the correct value', () => {
      make.success().match({success, failure, pending});

      expect(success).to.have.been.calledWith(successValue);
      expect(failure).to.not.have.been.called;
      expect(pending).to.not.have.been.called;
    });

    it('invokes the failure handler with the correct error', () => {
      make.failure().match({success, failure, pending});

      expect(success).to.not.have.been.called;
      expect(failure).to.have.been.calledWith(failureValue);
      expect(pending).to.not.have.been.called;
    });
  });

  describe('accept', () => {
    const never = new Promise<never>((_resolve, _reject) => {});
    const resolved = Promise.resolve(successValue);
    const rejected = Promise.reject(failureValue);
    // Suppress PromiseRejectionHandledWarning in node:
    rejected.catch(() => {});

    let f: Failable<number>;
    beforeEach(() => f = new Failable<number>());

    it('first transitions to pending', () => {
      f.success(successValue);
      f.accept(never);

      expect(f.internalState).to.eq(Future.State.pending);
      expect(f.internalData).to.be.undefined;
    });

    it('transitions to success when the promise is fulfilled', () => {
      f.accept(resolved);

      when(
        () => !f.isPending,
        () => {
          expect(f.internalState).to.eq(Future.State.success);
          expect(f.internalData).to.eql(successValue);
        }
      );
    });

    it('transitions to failure when the promise is rejected', () => {
      f.accept(rejected);

      when(
        () => !f.isPending,
        () => {
          expect(f.internalState).to.eq(Future.State.failure);
          expect(f.internalData).to.eql(failureValue);
        }
      );
    });
  });

  describe('successOr', () => {
    const fallback = 4;

    it('returns the value when success', () => {
      const result = make.success().successOr(fallback);

      expect(result).to.eql(successValue);
      expect(result).to.not.eql(fallback);
    });

    it('returns the fallback when failure', () => {
      const result = make.failure().successOr(fallback);

      expect(result).to.not.eql(successValue);
      expect(result).to.eql(fallback);
    });

    it('returns the fallback when pending', () => {
      const result = make.pending().successOr(fallback);

      expect(result).to.not.eql(successValue);
      expect(result).to.eql(fallback);
    });
  });

  describe('failureOr', () => {
    const fallback = new Error();

    it('returns the fallback when success', () => {
      const result = make.success().failureOr(fallback);

      expect(result).to.not.eq(failureValue);
      expect(result).to.eq(fallback);
    });

    it('returns the error when failure', () => {
      const result = make.failure().failureOr(fallback);

      expect(result).to.eq(failureValue);
      expect(result).to.not.eq(fallback);
    });

    it('returns the fallback when pending', () => {
      const result = make.pending().failureOr(fallback);

      expect(result).to.not.eq(failureValue);
      expect(result).to.eq(fallback);
    });
  });
});
