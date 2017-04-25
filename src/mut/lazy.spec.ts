import {expect, use} from 'chai';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

import {Lazy} from './lazy';

use(sinonChai);

describe('Lazy', () => {
  describe('force', () => {
    it('returns the value as-is when given a non-function', () => {
      const v = 3;
      const l: Lazy<number> = v;

      expect(Lazy.force(l)).to.eql(v);
    });

    it('invokes the function and returns its result when given one', () => {
      const v = 3;
      const l: Lazy<number> = sinon.spy(() => v);

      expect(Lazy.force(l)).to.eql(v);
      expect(l).to.have.been.calledOnce;
    });
  });
});
