import {expect} from 'chai';
import {computed, useStrict} from 'mobx';

import {Failable as F} from './';

useStrict(true);

const empty = () => {};

class Failable<T> extends F<T> {
  @computed get internalData() { return this.data; }
  @computed get internalState() { return this.state; }
}

describe('Failable (mutable)', () => {
  const successValue = 3;
  const failureValue = new Error();
  const pending = new Failable<number>();
  const success = new Failable<number>().success(successValue);
  const failure = new Failable<number>().failure(failureValue);

  describe('constructor', () => {
    const f = new Failable<void>();

    it('initializes the state as "pending"', () => {
      expect(f.internalState.get()).to.eq(Failable.State.pending);
    });
  });

  describe('success', () => {
    it('sets the internal state to "success"', () => {
      expect(success.internalState.get()).to.eq(Failable.State.success);
    });

    it('sets the internal data to the given value', () => {
      expect(success.internalData.get()).to.eq(successValue);
    });
  });

  describe('failure', () => {
    it('sets the internal state to "failure"', () => {
      expect(failure.internalState.get()).to.eq(Failable.State.failure);
    });

    it('sets the internal data to the given value', () => {
      expect(failure.internalData.get()).to.eq(failureValue);
    });
  });

  describe('pending', () => {
    const f = new Failable<number>().pending();

    it('sets the internal state to "pending"', () => {
      expect(f.internalState.get()).to.eq(Failable.State.pending);
    });
  });

  describe('isSuccess', () => {
    it('is true when success', () => {
      expect(success.isSuccess).to.be.true;
    });

    it('is false when failure', () => {
      expect(success.isFailure).to.be.false;
    });

    it('is false when pending', () => {
      expect(success.isPending).to.be.false;
    });
  });

  describe('isFailure', () => {
    it('is false when success', () => {
      expect(failure.isSuccess).to.be.false;
    });

    it('is true when failure', () => {
      expect(failure.isFailure).to.be.true;
    });

    it('is false when pending', () => {
      expect(failure.isPending).to.be.false;
    });
  });

  describe('isPending', () => {
    it('is false when success', () => {
      expect(pending.isSuccess).to.be.false;
    });

    it('is false when failure', () => {
      expect(pending.isFailure).to.be.false;
    });

    it('is true when pending', () => {
      expect(pending.isPending).to.be.true;
    });
  });

  describe('match', () => {
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
