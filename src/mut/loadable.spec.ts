import {expect, use} from 'chai';
import {useStrict, computed, when} from 'mobx';
import {Enum} from 'typescript-string-enums';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

import {Loadable as L} from './loadable';

use(sinonChai);
useStrict(true);

describe('Loadable (mutable)', () => {
  class Loadable<T> extends L<T> {
    @computed get internalData(): T | Error | undefined { return this.data; }
    @computed get internalState(): L.State { return this.state; }

    calledSuccess = false;
    didBecomeSuccess(_: T) { this.calledSuccess = true; }

    calledFailure = false;
    didBecomeFailure(_: Error) { this.calledFailure = true; }

    calledLoading = false;
    didBecomeLoading() { this.calledLoading = true; }
  }

  const successValue = 3;
  const failureValue = new Error();

  type LoadableFactory<T> = {[State in L.State]: () => Loadable<T>};

  const make: LoadableFactory<number> = {
    empty: () => new Loadable<number>(),
    pending: () => new Loadable<number>().pending(),
    success: () => new Loadable<number>().success(successValue),
    reloading: () => new Loadable<number>().success(successValue).pending(),
    failure: () => new Loadable<number>().failure(failureValue),
    retrying: () => new Loadable<number>().failure(failureValue).pending()
  };

  describe('constructor', () => {
    it('initializes the state as empty', () => {
      const l = new Loadable<any>();

      expect(l.internalState).to.eq(L.State.empty);
    });
  });

  describe('success', () => {
    let l: Loadable<number>;
    beforeEach(() => l = make.success());

    it('sets the internal state to success', () => {
      expect(l.internalState).to.eq(L.State.success);
    });

    it('sets the internal data to the given value', () => {
      expect(l.internalData).to.eq(successValue);
    });

    it('invokes didBecomeSuccess', () => {
      expect(l.calledSuccess).to.be.true;
      expect(l.calledFailure).to.be.false;
      expect(l.calledLoading).to.be.false;
    });
  });

  describe('failure', () => {
    let l: Loadable<number>;
    beforeEach(() => l = make.failure());

    it('sets the internal state to failure', () => {
      expect(l.internalState).to.eq(L.State.failure);
    });

    it('sets the internal data to the given value', () => {
      expect(l.internalData).to.eq(failureValue);
    });

    it('invokes didBecomeFailure', () => {
      expect(l.calledSuccess).to.be.false;
      expect(l.calledFailure).to.be.true;
      expect(l.calledLoading).to.be.false;
    });
  });

  describe('loading', () => {
    it('sets the internal state to reloading when success', () => {
      const l = make.success().loading();

      expect(l.internalState).to.eq(L.State.reloading);
      expect(l.internalData).to.eq(successValue);
    });

    it('sets the internal state to retrying when failure', () => {
      const l = make.failure().loading();

      expect(l.internalState).to.eq(L.State.retrying);
      expect(l.internalData).to.eq(failureValue);
    });

    it('sets the internal state to pending when empty', () => {
      const l = make.empty().loading();

      expect(l.internalState).to.eq(L.State.pending);
      expect(l.internalData).to.eq(undefined);
    });

    it('invokes didBecomeLoading', () => {
      const l = make.empty().loading();

      expect(l.calledSuccess).to.be.false;
      expect(l.calledFailure).to.be.false;
      expect(l.calledLoading).to.be.true;
    });

    it('does nothing when already loading', () => {
      for (const l of [make.pending(), make.reloading(), make.retrying()]) {
        l.calledLoading = false;
        l.loading();

        expect(l.calledLoading).to.be.false;
      }
    });
  });

  describe('pending', () => {
    it('calls `loading`', () => {
      const l = make.empty();
      const loading = sinon.spy(l, 'loading');
      l.pending();

      expect(loading).to.have.been.called;
    });
  });

  function expectProperties<T, K extends keyof Loadable<T>>(
    factory: LoadableFactory<T>,
    propertyName: K,
    expectations: {[State in L.State]: Loadable<T>[K]}
  ): void {
    for (const state of Enum.keys(L.State)) {
      const l = factory[state]();
      const expected = expectations[state];
      const actual = l[propertyName];

      it(`is ${expected} when ${state}`, () => {
        expect(actual).to.eql(expected);
      });
    }
  }

  describe('isSuccess', () => {
    expectProperties(make, 'isSuccess', {
      success: true,
      reloading: true,
      failure: false,
      retrying: false,
      empty: false,
      pending: false
    });
  });

  describe('isFailure', () => {
    expectProperties(make, 'isFailure', {
      success: false,
      reloading: false,
      failure: true,
      retrying: true,
      empty: false,
      pending: false
    });
  });

  describe('isPending', () => {
    expectProperties(make, 'isPending', {
      success: false,
      reloading: false,
      failure: false,
      retrying: false,
      empty: true,
      pending: true
    });
  });

  describe('isLoading', () => {
    expectProperties(make, 'isLoading', {
      success: false,
      reloading: true,
      failure: false,
      retrying: true,
      empty: false,
      pending: true
    });
  });

  describe('match', () => {
    let success: sinon.SinonSpy;
    let failure: sinon.SinonSpy;
    let pending: sinon.SinonSpy;
    beforeEach(() => {
      [success, failure, pending] = [sinon.spy(), sinon.spy(), sinon.spy()];
    });

    describe('when availability is none', () => {
      it('invokes the handler with false when empty', () => {
        make.empty().match({success, failure, pending});

        expect(success).to.not.have.been.called;
        expect(failure).to.not.have.been.called;
        expect(pending).to.have.been.calledWith(false);
      });

      it('invokes the handler with true when pending', () => {
        make.pending().match({success, failure, pending});

        expect(success).to.not.have.been.called;
        expect(failure).to.not.have.been.called;
        expect(pending).to.have.been.calledWith(true);
      });
    });

    describe('when availability is value', () => {
      it('invokes the handler with (value, false) when success', () => {
        make.success().match({success, failure, pending});

        expect(success).to.have.been.calledWith(successValue, false);
        expect(failure).to.not.have.been.called;
        expect(pending).to.not.have.been.called;
      });

      it('invokes the handler with (value, true) when reloading', () => {
        make.reloading().match({success, failure, pending});

        expect(success).to.have.been.calledWith(successValue, true);
        expect(failure).to.not.have.been.called;
        expect(pending).to.not.have.been.called;
      });
    });

    describe('when availability is error', () => {
      it('invokes the handler with (error, false) when failure', () => {
        make.failure().match({success, failure, pending});

        expect(success).to.not.have.been.called;
        expect(failure).to.have.been.calledWith(failureValue, false);
        expect(pending).to.not.have.been.called;
      });

      it('invokes the handler with (error, true) when retrying', () => {
        make.retrying().match({success, failure, pending});

        expect(success).to.not.have.been.called;
        expect(failure).to.have.been.calledWith(failureValue, true);
        expect(pending).to.not.have.been.called;
      });
    });
  });

  describe('accept', () => {
    const never = new Promise<never>((_resolve, _reject) => {});
    const resolved = Promise.resolve(successValue);
    const rejected = Promise.reject(failureValue);
    // Suppress PromiseRejectionHandledWarning in node:
    rejected.catch(() => {});

    it('first transitions to pending when empty', () => {
      const l = make.empty();
      const previousData = l.internalData;
      l.accept(never);

      expect(l.internalState).to.eq(L.State.pending);
      expect(l.internalData).to.eql(previousData);
    });

    it('first transitions to reloading when success', () => {
      const l = make.success();
      const previousData = l.internalData;
      l.accept(never);

      expect(l.internalState).to.eq(L.State.reloading);
      expect(l.internalData).to.eql(previousData);
    });

    it('first transitions to retrying when failure', () => {
      const l = make.failure();
      const previousData = l.internalData;
      l.accept(never);

      expect(l.internalState).to.eq(L.State.retrying);
      expect(l.internalData).to.eql(previousData);
    });

    it('transitions to success when the promise is fulfilled', () => {
      const l = make.empty();
      l.accept(resolved);

      when(
        () => !l.isPending,
        () => {
          expect(l.internalState).to.eq(L.State.success);
          expect(l.internalData).to.eql(successValue);
        }
      );
    });

    it('transitions to failure when the promise is rejected', () => {
      const l = make.empty();
      l.accept(rejected);

      when(
        () => !l.isPending,
        () => {
          expect(l.internalState).to.eq(L.State.failure);
          expect(l.internalData).to.eql(failureValue);
        }
      );
    });
  });
});
