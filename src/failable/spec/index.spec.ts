import {expect} from 'chai';

import {Failable} from '..';
import {success, pending, failure} from '../../common';

function clearAllHandlers(): void {
  for (const state of states) {
    const handlers = Failable._handlersOf(state);
    handlers.splice(0, handlers.length);
  }
}

const aSuccess = success(42);
const aFailure = failure(new Error('no meaning found'));
const states: Failable.State[] = ['pending', 'failure', 'success'];

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

describe('Failable._handlersOf', () => {
  states.forEach(state => {
    it(`returns an array given a ${state} state`, () => {
      const result = Failable._handlersOf(state);

      expect(Array.isArray(result)).to.be.true;
    });
  });

  it('throws given an unknown state', () => {
    expect(() => {
      const f = Failable._handlersOf as Function;
      f('foobar');
    }).to.throw(TypeError);
  });
});

describe('Failable.dispatch', () => {
  states.forEach(state => {
    it(`dispatches ${state} handlers`, () => {
      const result: number[] = [];
      const handlers = Failable._handlersOf(state);
      handlers.push(n => result.push(n + 1));
      handlers.push(n => result.push(n + 2));
      handlers.push(n => result.push(n + 3));

      Failable.dispatch(state, 0);

      expect(result).to.deep.equal([1, 2, 3]);
    });
  });
});

const emptyOptions: Failable.WhenOptions<any, void, void, void> = {
  success: (_: any) => {},
  pending: () => {},
  failure: (_: any) => {}
};

describe('Failable.addListener', () => {
  afterEach(clearAllHandlers);

  it('invokes all pending handlers when `when` is called', () => {
    const result: number[] = [];
    Failable.addListener('pending', () => result.push(1));
    Failable.addListener('pending', () => result.push(2));

    Failable.when(pending, emptyOptions);

    expect(result).to.deep.equal([1, 2]);
  });

  it('invokes all failure handlers when `when` is called', () => {
    const e1 = new Error();
    const e2 = new Error();
    const result: Error[] = [];
    Failable.addListener('failure', _ => result.push(e1));
    Failable.addListener('failure', _ => result.push(e2));

    Failable.when(failure(e1), emptyOptions);

    expect(result).to.deep.equal([e1, e2]);
  });

  it('invokes all success handlers when `when` is called', () => {
    const value = 5;
    const result: number[] = [];
    Failable.addListener('success', (v: number) => result.push(v));
    Failable.addListener('success', (v: number) => result.push(v + 1));

    Failable.when(success(value), emptyOptions);

    expect(result).to.deep.equal([value, value + 1]);
  });
});

describe('Failable.removeListener', () => {
  afterEach(clearAllHandlers);

  const a = (_: any) => {};
  const b = (_: any) => {};
  const c = (_: any) => {};

  states.forEach(state => {
    it(`removes a specific ${state} handler`, () => {
      const handlers = Failable._handlersOf(state);
      handlers.push(a);
      handlers.push(b);
      handlers.push(c);

      Failable.removeListener(state, b);

      expect(handlers).to.deep.equal([a, c]);
    });

    it(`removes all ${state} handlers`, () => {
      const handlers = Failable._handlersOf(state);
      handlers.push(a);
      handlers.push(b);
      handlers.push(c);

      Failable.removeListener(state);

      expect(handlers).to.be.empty;
    });
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
