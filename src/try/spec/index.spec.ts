import {expect} from 'chai';

import {Try} from '..';
import {pending, failure, success} from '../../common';

describe('Try', () => {
  const states: Try.State[] = ['pending', 'failure', 'success'];

  function clearAllHandlers(): void {
    for (const state of states) {
      const handlers = Try._handlersOf(state);
      handlers.splice(0, handlers.length);
    }
  }

  afterEach(clearAllHandlers);

  describe('_dispatch', () => {
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

  describe('on', () => {
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
      Try.on('failure', e => result.push(e));
      Try.on('failure', e => result.push(e2));

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

  describe('off', () => {
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
});
