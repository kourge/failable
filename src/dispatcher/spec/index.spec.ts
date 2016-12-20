import {expect} from 'chai';

import {Dispatcher} from '..';

describe('Dispatcher', () => {
  type ABC = 'a' | 'b' | 'c';
  const validStates: ABC[] = ['a', 'b', 'c'];

  class ABCD extends Dispatcher<ABC> {
    constructor() {
      super(validStates);
    }
  }

  describe('constructor', () => {
    it('constructs directly', () => {
      expect(() => {
        new Dispatcher<ABC>(validStates);
      }).to.not.throw(Error);
    });

    it('constructs in a subclass', () => {
      expect(() => {
        new ABCD();
      }).to.not.throw(Error);
    });
  });

  describe('handlersOf', () => {
    const d = new ABCD();

    validStates.forEach(state => {
      it(`returns an array given a '${state}' state`, () => {
        const result = d.handlersOf(state);

        expect(Array.isArray(result)).to.be.true;
      });
    });

    it('throws given an unknown state', () => {
      expect(() => {
        (d.handlersOf as Function)('foobar');
      }).to.throw(TypeError);
    });
  });

  describe('clear', () => {
    const d = new ABCD();

    it('removes handlers for every state', () => {
      validStates.forEach(state => {
        d.addListener(state, () => {});
      });

      validStates.forEach(state => {
        const handlers = d.handlersOf(state);
        expect(handlers).to.not.be.empty;
      });

      d.clear();

      validStates.forEach(state => {
        const handlers = d.handlersOf(state);
        expect(handlers).to.be.empty;
      });
    });
  });

  describe('dispatch', () => {
    const d = new ABCD();

    validStates.forEach(state => {
      it(`dispatches ${state} handlers`, () => {
        const result: number[] = [];
        const handlers = d.handlersOf(state);
        handlers.push(n => result.push(n + 1));
        handlers.push(n => result.push(n + 2));
        handlers.push(n => result.push(n + 3));

        d.dispatch(state, 0);

        expect(result).to.deep.equal([1, 2, 3]);
      });
    });
  });

  describe('addListener', () => {
    const d = new ABCD();
    afterEach(() => {
      d.clear();
    });

    it("invokes all 'a' handlers when `dispatch` is called with 'a'", () => {
      const result: number[] = [];
      d.addListener('a', x => result.push(x + 1));
      d.addListener('a', x => result.push(x + 2));
      d.addListener('b', x => result.push(x + 3));

      d.dispatch('a', 0);

      expect(result).to.eql([1, 2]);
    });

    it("does not invoke 'a' handlers when `dispatch` is called with 'b'", () => {
      const result: number[] = [];
      d.addListener('a', x => result.push(x + 1));
      d.addListener('a', x => result.push(x + 2));
      d.addListener('b', x => result.push(x + 3));

      d.dispatch('b', 1);

      expect(result).to.not.eql([1, 2]);
    });

    it('throws when invoked with invalid state', () => {
      expect(() => {
        (d.addListener as Function)('foobar', () => {});
      }).to.throw(TypeError);
    });
  });

  describe('removeListener', () => {
    const d = new ABCD();
    afterEach(() => {
      d.clear();
    });

    const a = (_: any) => {};
    const b = (_: any) => {};
    const c = (_: any) => {};

    validStates.forEach(state => {
      it(`removes a specific ${state} handler`, () => {
        const handlers = d.handlersOf(state);
        handlers.push(a);
        handlers.push(b);
        handlers.push(c);

        d.removeListener(state, b);

        expect(handlers).to.deep.equal([a, c]);
      });

      it(`removes all ${state} handlers`, () => {
        const handlers = d.handlersOf(state);
        handlers.push(a);
        handlers.push(b);
        handlers.push(c);

        d.removeListener(state);

        expect(handlers).to.be.empty;
      });
    });

    it('throws when invoked with invalid state', () => {
      expect(() => {
        (d.removeListener as Function)('foobar', () => {});
      }).to.throw(TypeError);
    });
  });
});
