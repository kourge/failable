import {expect} from 'chai';
import {computed, useStrict} from 'mobx';

import {Failable as F} from './';

const empty = () => {};
const successValue = 3;
const failureValue = new Error();

useStrict(true);

describe('Failable (mutable)', () => {
  class Failable<T> extends F<T> {
    @computed get internalData(): T | Error | undefined { return this.data; }
    @computed get internalState(): F.State { return this.state; }

    calledSuccess = false;
    didBecomeSuccess(_: T) { this.calledSuccess = true; }

    calledFailure = false;
    didBecomeFailure(_: Error) { this.calledFailure = true; }

    calledPending = false;
    didBecomePending() { this.calledPending = true; }
  }

  describe('constructor', () => {
    const f = new Failable<void>();

    it('initializes the state as "pending"', () => {
      expect(f.internalState).to.eq(Failable.State.pending);
    });
  });

  describe('success', () => {
    let f: Failable<number>;
    beforeEach(() => f = new Failable<number>().success(successValue));

    it('sets the internal state to "success"', () => {
      expect(f.internalState).to.eq(Failable.State.success);
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
    beforeEach(() => f = new Failable<number>().failure(failureValue));

    it('sets the internal state to "failure"', () => {
      expect(f.internalState).to.eq(Failable.State.failure);
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
    beforeEach(() => f = new Failable<number>().pending());

    it('sets the internal state to "pending"', () => {
      expect(f.internalState).to.eq(Failable.State.pending);
    });

    it('invokes didBecomePending', () => {
      expect(f.calledSuccess).to.be.false;
      expect(f.calledFailure).to.be.false;
      expect(f.calledPending).to.be.true;
    });
  });

  describe('isSuccess', () => {
    let f: Failable<number>;
    beforeEach(() => f = new Failable<number>().success(successValue));

    it('is true when success', () => {
      expect(f.isSuccess).to.be.true;
    });

    it('is false when failure', () => {
      expect(f.isFailure).to.be.false;
    });

    it('is false when pending', () => {
      expect(f.isPending).to.be.false;
    });
  });

  describe('isFailure', () => {
    let f: Failable<number>;
    beforeEach(() => f = new Failable<number>().failure(failureValue));

    it('is false when success', () => {
      expect(f.isSuccess).to.be.false;
    });

    it('is true when failure', () => {
      expect(f.isFailure).to.be.true;
    });

    it('is false when pending', () => {
      expect(f.isPending).to.be.false;
    });
  });

  describe('isPending', () => {
    let f: Failable<number>;
    beforeEach(() => f = new Failable<number>().pending());

    it('is false when success', () => {
      expect(f.isSuccess).to.be.false;
    });

    it('is false when failure', () => {
      expect(f.isFailure).to.be.false;
    });

    it('is true when pending', () => {
      expect(f.isPending).to.be.true;
    });
  });

  describe('match', () => {
    const pending = new Failable<number>();
    const success = new Failable<number>().success(successValue);
    const failure = new Failable<number>().failure(failureValue);

    it('invokes the pending handler', () => {
      let called = false;
      pending.match({
        pending: () => called = true,
        success: empty,
        failure: empty
      });

      expect(called).to.be.true;
    });

    it('does not invoke other handlers when pending', () => {
      const result: boolean[] = [];
      pending.match({
        pending: empty,
        success: (_data) => result.push(true),
        failure: (_error) => result.push(true)
      });

      expect(result).to.be.empty;
    });

    it('invokes the success handler with the correct value', () => {
      let called = false;
      success.match({
        pending: empty,
        success: (data) => {
          called = true;
          expect(data).to.eq(successValue);
        },
        failure: empty
      });

      expect(called).to.be.true;
    });

    it('does not invoke other handlers when success', () => {
      const result: boolean[] = [];
      success.match({
        pending: () => result.push(true),
        success: empty,
        failure: (_error) => result.push(true)
      });

      expect(result).to.be.empty;
    });

    it('invokes the failure handler', () => {
      let called = false;
      failure.match({
        pending: empty,
        success: empty,
        failure: (error) => {
          called = true;
          expect(error).to.eq(failureValue);
        }
      });

      expect(called).to.be.true;
    });

    it('does not invoke other handlers when failure', () => {
      const result: boolean[] = [];
      failure.match({
        pending: () => result.push(true),
        success: (_data) => result.push(true),
        failure: empty
      });

      expect(result).to.be.empty;
    });
  });
});
