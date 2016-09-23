import {expect} from 'chai';

import {Try} from '..';
import {Failable, pending, failure, success, isFailure} from '../../common';

describe('Try', () => {
  const states: Try.State[] = ['pending', 'failure', 'success'];

  function clearAllHandlers(): void {
    for (const state of states) {
      const handlers = Try._handlersOf(state);
      handlers.splice(0, handlers.length);
    }
  }

  afterEach(clearAllHandlers);

  describe('.constructor', () => {
    it('wraps an existing Failable', () => {
      const t = new Try(pending);

      expect(t.failable).to.equal(pending);
    });

    it('evaluates a function when given one', () => {
      const t = new Try(() => { throw new Error('no meaning found'); });

      expect(isFailure(t.failable)).to.be.true;
    });

    it('throws when given a non-Failable', () => {
      expect(() => {
        new Try({error: null} as any as Failable<string>);
      }).to.throw(TypeError);
    });
  });

  describe('._handlersOf', () => {
    states.forEach(state => {
      it(`returns an array given a ${state} state`, () => {
        const result = Try._handlersOf(state);

        expect(Array.isArray(result)).to.be.true;
      });
    });

    it('throws given an unknown state', () => {
      expect(() => {
        const f = Try._handlersOf as Function;
        f('foobar');
      }).to.throw(TypeError);
    });
  });

  describe('._dispatch', () => {
    states.forEach(state => {
      it(`dispatches ${state} handlers`, () => {
        const result: number[] = [];
        const handlers = Try._handlersOf(state);
        handlers.push(n => result.push(n + 1));
        handlers.push(n => result.push(n + 2));
        handlers.push(n => result.push(n + 3));

        Try._dispatch(state, 0);

        expect(result).to.deep.equal([1, 2, 3]);
      });
    });
  });

  describe('.on', () => {
    it('invokes all pending handlers on Try instantiation', () => {
      const result: number[] = [];
      Try.on('pending', () => result.push(1));
      Try.on('pending', () => result.push(2));

      new Try(pending);

      expect(result).to.deep.equal([1, 2]);
    });

    it('invokes all failure handlers on Try instantiation', () => {
      const e1 = new Error();
      const e2 = new Error();
      const result: Error[] = [];
      Try.on('failure', _ => result.push(e1));
      Try.on('failure', _ => result.push(e2));

      new Try(failure(e1));

      expect(result).to.deep.equal([e1, e2]);
    });

    it('invokes all success handlers on Try instantiation', () => {
      const value = 5;
      const result: number[] = [];
      Try.on('success', (v: number) => result.push(v));
      Try.on('success', (v: number) => result.push(v + 1));

      new Try(success(value));

      expect(result).to.deep.equal([value, value + 1]);
    });
  });

  describe('.off', () => {
    states.forEach(state => {
      const a = () => {};
      const b = () => {};
      const c = () => {};

      it(`removes a specific ${state} handler`, () => {
        const handlers = Try._handlersOf(state);
        handlers.push(a);
        handlers.push(b);
        handlers.push(c);

        Try.off(state, b);

        expect(handlers).to.deep.equal([a, c]);
      });

      it(`removes all ${state} handlers`, () => {
        const handlers = Try._handlersOf(state);
        handlers.push(a);
        handlers.push(b);
        handlers.push(c);

        Try.off(state);

        expect(handlers).to.be.empty;
      });
    });
  });

  describe('on', () => {
    let successCalled = false;
    let failureCalled = false;
    let pendingCalled = false;

    function reset() {
      successCalled = false;
      failureCalled = false;
      pendingCalled = false;
    }
    beforeEach(reset);

    const options = {
      success() { successCalled = true; },
      failure() { failureCalled = true; },
      pending() { pendingCalled = true; }
    };

    describe('when success', () => {
      const t = new Try(success(42));

      it('invokes the success callback', () => {
        t.on(options);
        expect(successCalled).to.be.true;
      });

      it('does not invoke the failure callback', () => {
        t.on(options);
        expect(failureCalled).to.be.false;
      });

      it('does not invoke the pending callback', () => {
        t.on(options);
        expect(pendingCalled).to.be.false;
      });
    });

    describe('when failure', () => {
      const t = new Try(failure(new Error('no meaning found')));

      it('does not invoke the success callback', () => {
        t.on(options);
        expect(successCalled).to.be.false;
      });

      it('invokes the failure callback', () => {
        t.on(options);
        expect(failureCalled).to.be.true;
      });

      it('does not invoke the pending callback', () => {
        t.on(options);
        expect(pendingCalled).to.be.false;
      });
    });

    describe('when pending', () => {
      const t = new Try(pending);

      it('does not invoke the success callback', () => {
        t.on(options);
        expect(successCalled).to.be.false;
      });

      it('does not invoke the failure callback', () => {
        t.on(options);
        expect(failureCalled).to.be.false;
      });

      it('invokes the pending callback', () => {
        t.on(options);
        expect(pendingCalled).to.be.true;
      });
    });

    it('throws when the Try does not wrap a Failable', () => {
      const t: Try<any> = new Try(pending);
      t.failable = {error: null} as any as Failable<any>;

      expect(() => {
        t.on(options);
      }).to.throw(TypeError);
    });
  });
});
